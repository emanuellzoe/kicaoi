// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KicaoiFarm
 * @notice Minimal idle-farming game for Celo / MiniPay.
 *
 *  Players buy internal SEED credits with native CELO (default 1 CELO = 100 SEED),
 *  then plant -> wait -> harvest on per-player plots. Each action is one onchain tx.
 *
 *  Design constraints (by intent):
 *   - SEED is INTERNAL, NON-TRANSFERABLE, NON-REDEEMABLE (arcade credit, not a token).
 *     => There is NO user payout path, hence no prize-pool / solvency / payout-reentrancy
 *        surface. The only CELO out is the owner treasury withdrawal.
 *   - NO loops in any state-changing function. Plots are keyed by id in a nested mapping,
 *     so every action touches exactly one O(1) slot.
 *   - NO randomness. Outcomes depend only on time (block.timestamp) and player input.
 *   - Packed storage: a Plot fits in a single 32-byte slot.
 */
contract KicaoiFarm is Ownable, ReentrancyGuard {
    /* ------------------------------------------------------------------ */
    /*                               Types                                */
    /* ------------------------------------------------------------------ */

    struct CropConfig {
        uint128 plantCost; // SEED burned to plant
        uint128 yieldAmount; // SEED credited on harvest
        uint64 growTime; // seconds until mature
        bool enabled;
    }

    /// @dev Packs into one slot: 8 + 64 = 72 bits used of 256.
    struct Plot {
        uint8 cropId; // 0 == empty
        uint64 plantedAt; // block.timestamp at plant
    }

    struct PlayerStats {
        uint64 plotCount; // plots owned (also the next plot id)
        uint64 totalPlanted; // lifetime plant actions
        uint64 totalHarvested; // lifetime harvest actions
        uint256 totalSeedHarvested; // lifetime SEED earned (leaderboard key)
    }

    /* ------------------------------------------------------------------ */
    /*                               State                                */
    /* ------------------------------------------------------------------ */

    /// @notice Internal SEED credit balance per player.
    mapping(address => uint256) public seedBalance;

    /// @notice plots[player][plotId] => Plot.
    mapping(address => mapping(uint256 => Plot)) public plots;

    /// @notice Lifetime stats per player (plotCount lives here).
    mapping(address => PlayerStats) public stats;

    /// @notice Crop configs keyed by cropId (cropId 0 is reserved for "empty").
    mapping(uint8 => CropConfig) public crops;

    /// @notice CELO -> SEED conversion rate (SEED per 1e18 wei of CELO).
    uint256 public seedPerCelo;

    /// @notice Plots a player receives on their first buy.
    uint64 public startingPlots;

    /// @notice Unlock cost = unlockBaseCost * currentPlotCount.
    uint256 public unlockBaseCost;

    /* ------------------------------------------------------------------ */
    /*                               Events                               */
    /* ------------------------------------------------------------------ */

    event SeedsBought(address indexed user, uint256 celoAmount, uint256 seedCredited);
    event Planted(address indexed user, uint256 indexed plotId, uint8 cropId, uint256 plantedAt);
    event Harvested(
        address indexed user, uint256 indexed plotId, uint8 cropId, uint256 yieldAmount
    );
    event PlotUnlocked(address indexed user, uint256 newPlotCount, uint256 cost);
    event CropUpdated(
        uint8 indexed cropId, uint256 plantCost, uint256 growTime, uint256 yieldAmount, bool enabled
    );
    event SeedRateUpdated(uint256 seedPerCelo);
    event CeloWithdrawn(address indexed to, uint256 amount);

    /* ------------------------------------------------------------------ */
    /*                               Errors                               */
    /* ------------------------------------------------------------------ */

    error ZeroValue();
    error CropDisabled();
    error PlotOutOfRange();
    error PlotNotEmpty();
    error PlotEmpty();
    error NotMature();
    error InsufficientSeed();
    error NoPlots();
    error TransferFailed();

    /* ------------------------------------------------------------------ */
    /*                             Constructor                            */
    /* ------------------------------------------------------------------ */

    constructor() Ownable(msg.sender) {
        seedPerCelo = 100; // 1 CELO = 100 SEED
        startingPlots = 3;
        unlockBaseCost = 50;

        // Default crop roster (cost / grow / yield). Owner can retune via setCrop.
        _setCrop(1, 5, 5 minutes, 9, true); // Wheat
        _setCrop(2, 20, 30 minutes, 38, true); // Pumpkin
        _setCrop(3, 60, 2 hours, 130, true); // Golden Crop
    }

    /* ------------------------------------------------------------------ */
    /*                           Player actions                           */
    /* ------------------------------------------------------------------ */

    /**
     * @notice Buy SEED credits with native CELO. Initializes starting plots on first buy.
     * @dev No external call, no loop. CELO simply accrues in the contract as game revenue.
     */
    function buySeeds() external payable {
        if (msg.value == 0) revert ZeroValue();

        uint256 credited = (msg.value * seedPerCelo) / 1e18;

        PlayerStats storage s = stats[msg.sender];
        if (s.plotCount == 0) {
            s.plotCount = startingPlots; // first-time grant, O(1), no loop
        }

        seedBalance[msg.sender] += credited;
        emit SeedsBought(msg.sender, msg.value, credited);
    }

    /**
     * @notice Plant a crop on an empty plot. Burns the crop's plant cost in SEED.
     */
    function plant(uint256 plotId, uint8 cropId) external {
        CropConfig memory c = crops[cropId];
        if (!c.enabled) revert CropDisabled();

        PlayerStats storage s = stats[msg.sender];
        if (plotId >= s.plotCount) revert PlotOutOfRange();

        Plot storage p = plots[msg.sender][plotId];
        if (p.cropId != 0) revert PlotNotEmpty();

        uint256 bal = seedBalance[msg.sender];
        if (bal < c.plantCost) revert InsufficientSeed();

        // Effects
        seedBalance[msg.sender] = bal - c.plantCost;
        p.cropId = cropId;
        p.plantedAt = uint64(block.timestamp);
        unchecked {
            s.totalPlanted += 1;
        }

        emit Planted(msg.sender, plotId, cropId, block.timestamp);
    }

    /**
     * @notice Harvest a matured plot. Credits the crop's yield in SEED and clears the plot.
     */
    function harvest(uint256 plotId) external {
        PlayerStats storage s = stats[msg.sender];
        if (plotId >= s.plotCount) revert PlotOutOfRange();

        Plot storage p = plots[msg.sender][plotId];
        uint8 cropId = p.cropId;
        if (cropId == 0) revert PlotEmpty();

        CropConfig memory c = crops[cropId];
        // block.timestamp is used as a grow timer, not for randomness or value transfer.
        // A validator can nudge it a few seconds; with non-redeemable SEED there is no
        // economic gain, so this is acceptable by design.
        // forge-lint: disable-next-line(block-timestamp)
        if (block.timestamp < uint256(p.plantedAt) + c.growTime) revert NotMature();

        // Effects
        p.cropId = 0;
        p.plantedAt = 0;
        seedBalance[msg.sender] += c.yieldAmount;
        unchecked {
            s.totalHarvested += 1;
            s.totalSeedHarvested += c.yieldAmount;
        }

        emit Harvested(msg.sender, plotId, cropId, c.yieldAmount);
    }

    /**
     * @notice Unlock one additional plot. Cost scales with current plot count.
     * @dev Requires the player to have bought seeds first (plotCount > 0), otherwise the
     *      scaling cost would be zero and plots could be minted for free.
     */
    function unlockPlot() external {
        PlayerStats storage s = stats[msg.sender];
        uint256 count = s.plotCount;
        if (count == 0) revert NoPlots();

        uint256 cost = unlockBaseCost * count;
        uint256 bal = seedBalance[msg.sender];
        if (bal < cost) revert InsufficientSeed();

        seedBalance[msg.sender] = bal - cost;
        unchecked {
            // count is bounded by SEED spent (each unlock costs unlockBaseCost*count SEED);
            // reaching uint64 max is economically impossible. Cast is safe.
            // forge-lint: disable-next-line(unsafe-typecast)
            s.plotCount = uint64(count + 1);
        }

        emit PlotUnlocked(msg.sender, count + 1, cost);
    }

    /**
     * @notice Harvest all ready plots in a single transaction.
     * @dev Skips empty or unripe plots — reverts only if nothing was harvested.
     *      Reduces TX count from N to 1 for multi-plot harvests.
     */
    function batchHarvest(uint256[] calldata plotIds) external {
        PlayerStats storage s = stats[msg.sender];
        uint256 totalYield;
        uint64 harvestCount;

        for (uint256 i = 0; i < plotIds.length; ++i) {
            uint256 plotId = plotIds[i];
            if (plotId >= s.plotCount) revert PlotOutOfRange();

            Plot storage p = plots[msg.sender][plotId];
            uint8 cropId = p.cropId;
            if (cropId == 0) continue; // skip empty

            CropConfig memory c = crops[cropId];
            // forge-lint: disable-next-line(block-timestamp)
            if (block.timestamp < uint256(p.plantedAt) + c.growTime) continue; // skip unripe

            p.cropId = 0;
            p.plantedAt = 0;
            totalYield += c.yieldAmount;
            unchecked { harvestCount += 1; s.totalSeedHarvested += c.yieldAmount; }
            emit Harvested(msg.sender, plotId, cropId, c.yieldAmount);
        }

        require(harvestCount > 0, "nothing ready");
        seedBalance[msg.sender] += totalYield;
        unchecked { s.totalHarvested += harvestCount; }
    }

    /**
     * @notice Plant multiple plots in a single transaction.
     * @dev Validates all plots first, then deducts total SEED cost and plants.
     *      Caller must not pass duplicate plotIds.
     */
    function batchPlant(uint256[] calldata plotIds, uint8[] calldata cropIds) external {
        uint256 len = plotIds.length;
        require(len == cropIds.length && len > 0, "invalid args");

        PlayerStats storage s = stats[msg.sender];
        uint256 totalCost;

        // Validate pass: check crops and plots, accumulate cost.
        for (uint256 i = 0; i < len; ++i) {
            CropConfig memory c = crops[cropIds[i]];
            if (!c.enabled) revert CropDisabled();
            if (plotIds[i] >= s.plotCount) revert PlotOutOfRange();
            if (plots[msg.sender][plotIds[i]].cropId != 0) revert PlotNotEmpty();
            totalCost += c.plantCost;
        }

        uint256 bal = seedBalance[msg.sender];
        if (bal < totalCost) revert InsufficientSeed();
        seedBalance[msg.sender] = bal - totalCost;

        // Apply pass: write state.
        uint64 ts = uint64(block.timestamp);
        for (uint256 i = 0; i < len; ++i) {
            Plot storage p = plots[msg.sender][plotIds[i]];
            p.cropId = cropIds[i];
            p.plantedAt = ts;
            emit Planted(msg.sender, plotIds[i], cropIds[i], ts);
        }
        unchecked { s.totalPlanted += uint64(len); }
    }

    /* ------------------------------------------------------------------ */
    /*                                Views                               */
    /* ------------------------------------------------------------------ */

    function getPlot(address user, uint256 plotId) external view returns (Plot memory) {
        return plots[user][plotId];
    }

    function getStats(address user) external view returns (PlayerStats memory) {
        return stats[user];
    }

    /// @notice Cost to unlock the player's next plot.
    function nextUnlockCost(address user) external view returns (uint256) {
        return unlockBaseCost * stats[user].plotCount;
    }

    /// @notice True if the plot exists, is planted, and is mature (ready to harvest).
    function isReady(address user, uint256 plotId) external view returns (bool) {
        Plot memory p = plots[user][plotId];
        if (p.cropId == 0) return false;
        // View-only timer check; same rationale as harvest().
        // forge-lint: disable-next-line(block-timestamp)
        return block.timestamp >= uint256(p.plantedAt) + crops[p.cropId].growTime;
    }

    /**
     * @notice Read a contiguous range of a player's plots for the UI.
     * @dev VIEW ONLY. The loop here costs no gas to an external caller (eth_call) and never
     *      runs inside a state-changing transaction. `to` is exclusive; callers page with
     *      [0, plotCount).
     */
    function getPlots(address user, uint256 from, uint256 to)
        external
        view
        returns (Plot[] memory out)
    {
        if (to <= from) return new Plot[](0);
        out = new Plot[](to - from);
        for (uint256 i = from; i < to; ++i) {
            out[i - from] = plots[user][i];
        }
    }

    /* ------------------------------------------------------------------ */
    /*                                Admin                               */
    /* ------------------------------------------------------------------ */

    function setCrop(
        uint8 cropId,
        uint128 plantCost,
        uint64 growTime,
        uint128 yieldAmount,
        bool enabled
    ) external onlyOwner {
        _setCrop(cropId, plantCost, growTime, yieldAmount, enabled);
    }

    function setSeedRate(uint256 newSeedPerCelo) external onlyOwner {
        seedPerCelo = newSeedPerCelo;
        emit SeedRateUpdated(newSeedPerCelo);
    }

    function setUnlockBaseCost(uint256 newBaseCost) external onlyOwner {
        unlockBaseCost = newBaseCost;
    }

    function setStartingPlots(uint64 newStartingPlots) external onlyOwner {
        startingPlots = newStartingPlots;
    }

    /**
     * @notice Withdraw collected CELO (SEED-purchase revenue) to a treasury.
     * @dev The ONLY CELO-out path. CEI + checked call + nonReentrant (defense in depth;
     *      no user payout path exists).
     */
    function withdrawCelo(address payable to, uint256 amount) external onlyOwner nonReentrant {
        if (to == address(0)) revert TransferFailed();
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit CeloWithdrawn(to, amount);
    }

    /* ------------------------------------------------------------------ */
    /*                              Internal                              */
    /* ------------------------------------------------------------------ */

    function _setCrop(
        uint8 cropId,
        uint128 plantCost,
        uint64 growTime,
        uint128 yieldAmount,
        bool enabled
    ) internal {
        require(cropId != 0, "cropId 0 reserved");
        crops[cropId] =
            CropConfig({plantCost: plantCost, yieldAmount: yieldAmount, growTime: growTime, enabled: enabled});
        emit CropUpdated(cropId, plantCost, growTime, yieldAmount, enabled);
    }
}
