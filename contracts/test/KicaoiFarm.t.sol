// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {KicaoiFarm} from "../src/KicaoiFarm.sol";

contract KicaoiFarmTest is Test {
    KicaoiFarm farm;

    address owner = address(0xA11CE);
    address alice = address(0xB0B);
    address bob = address(0xCAFE);

    uint8 constant WHEAT = 1;
    uint8 constant PUMPKIN = 2;
    uint8 constant GOLDEN = 3;

    function setUp() public {
        vm.prank(owner);
        farm = new KicaoiFarm();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    /* --------------------------- buySeeds --------------------------- */

    function test_BuySeeds_CreditsAtRate_AndGrantsStartingPlots() public {
        vm.prank(alice);
        farm.buySeeds{value: 1 ether}();

        assertEq(farm.seedBalance(alice), 100, "1 CELO -> 100 SEED");
        (uint64 plotCount,,,) = farm.stats(alice);
        assertEq(plotCount, 3, "starting plots");
    }

    function test_BuySeeds_SecondBuy_AccumulatesSeed_NoExtraPlots() public {
        vm.startPrank(alice);
        farm.buySeeds{value: 5 ether}(); // 500 SEED, 3 plots
        farm.unlockPlot(); // 4 plots, -150 => 350
        farm.buySeeds{value: 1 ether}(); // +100 => 450, plots unchanged
        vm.stopPrank();

        assertEq(farm.seedBalance(alice), 450, "seed accumulates across buys");
        (uint64 plotCount,,,) = farm.stats(alice);
        assertEq(plotCount, 4, "second buy must not re-grant starting plots");
    }

    function test_BuySeeds_RevertsOnZero() public {
        vm.prank(alice);
        vm.expectRevert(KicaoiFarm.ZeroValue.selector);
        farm.buySeeds{value: 0}();
    }

    function test_BuySeeds_FractionalRate() public {
        vm.prank(alice);
        farm.buySeeds{value: 0.1 ether}();
        assertEq(farm.seedBalance(alice), 10, "0.1 CELO -> 10 SEED");
    }

    /* ---------------------------- plant ----------------------------- */

    function _fund(address who, uint256 celo) internal {
        vm.prank(who);
        farm.buySeeds{value: celo}();
    }

    function test_Plant_DeductsCost_SetsPlot() public {
        _fund(alice, 1 ether); // 100 SEED
        vm.prank(alice);
        farm.plant(0, WHEAT);

        assertEq(farm.seedBalance(alice), 95, "100 - 5");
        KicaoiFarm.Plot memory p = farm.getPlot(alice, 0);
        assertEq(p.cropId, WHEAT);
        assertEq(p.plantedAt, uint64(block.timestamp));
        (, uint64 totalPlanted,,) = farm.stats(alice);
        assertEq(totalPlanted, 1);
    }

    function test_Plant_RevertsOnDisabledCrop() public {
        _fund(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert(KicaoiFarm.CropDisabled.selector);
        farm.plant(0, 99); // unknown crop
    }

    function test_Plant_RevertsOnPlotOutOfRange() public {
        _fund(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert(KicaoiFarm.PlotOutOfRange.selector);
        farm.plant(3, WHEAT); // only plots 0..2 exist
    }

    function test_Plant_RevertsOnNonEmptyPlot() public {
        _fund(alice, 1 ether);
        vm.startPrank(alice);
        farm.plant(0, WHEAT);
        vm.expectRevert(KicaoiFarm.PlotNotEmpty.selector);
        farm.plant(0, WHEAT);
        vm.stopPrank();
    }

    function test_Plant_RevertsOnInsufficientSeed() public {
        _fund(alice, 0.01 ether); // 1 SEED only
        vm.prank(alice);
        vm.expectRevert(KicaoiFarm.InsufficientSeed.selector);
        farm.plant(0, WHEAT); // needs 5
    }

    /* --------------------------- harvest ---------------------------- */

    function test_Harvest_RevertsBeforeMature() public {
        _fund(alice, 1 ether);
        vm.startPrank(alice);
        farm.plant(0, WHEAT);
        vm.expectRevert(KicaoiFarm.NotMature.selector);
        farm.harvest(0);
        vm.stopPrank();
    }

    function test_Harvest_RevertsOnEmptyPlot() public {
        _fund(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert(KicaoiFarm.PlotEmpty.selector);
        farm.harvest(0);
    }

    function test_Harvest_CreditsYield_ResetsPlot_UpdatesStats() public {
        _fund(alice, 1 ether); // 100
        vm.startPrank(alice);
        farm.plant(0, WHEAT); // -5 => 95
        vm.warp(block.timestamp + 5 minutes);
        farm.harvest(0); // +9 => 104
        vm.stopPrank();

        assertEq(farm.seedBalance(alice), 104, "95 + 9");
        KicaoiFarm.Plot memory p = farm.getPlot(alice, 0);
        assertEq(p.cropId, 0, "plot cleared");
        assertEq(p.plantedAt, 0);
        (,, uint64 totalHarvested, uint256 totalSeedHarvested) = farm.stats(alice);
        assertEq(totalHarvested, 1);
        assertEq(totalSeedHarvested, 9);
    }

    function test_Harvest_ExactBoundary_IsMature() public {
        _fund(alice, 1 ether);
        uint256 t0 = block.timestamp;
        vm.startPrank(alice);
        farm.plant(0, WHEAT);
        vm.warp(t0 + 5 minutes); // exactly mature
        farm.harvest(0);
        vm.stopPrank();
        assertEq(farm.seedBalance(alice), 104);
    }

    function test_Replant_AfterHarvest_Works() public {
        _fund(alice, 1 ether);
        vm.startPrank(alice);
        farm.plant(0, WHEAT);
        vm.warp(block.timestamp + 5 minutes);
        farm.harvest(0);
        farm.plant(0, WHEAT); // replant same plot
        vm.stopPrank();
        KicaoiFarm.Plot memory p = farm.getPlot(alice, 0);
        assertEq(p.cropId, WHEAT);
    }

    /* -------------------------- unlockPlot -------------------------- */

    function test_UnlockPlot_DeductsScalingCost_AddsPlot() public {
        _fund(alice, 5 ether); // 500 SEED, 3 plots
        vm.prank(alice);
        farm.unlockPlot(); // cost = 50 * 3 = 150 => 350 left, 4 plots

        assertEq(farm.seedBalance(alice), 350);
        (uint64 plotCount,,,) = farm.stats(alice);
        assertEq(plotCount, 4);
        assertEq(farm.nextUnlockCost(alice), 200, "50 * 4");
    }

    function test_UnlockPlot_RevertsWithoutPlots() public {
        // bob never bought seeds
        vm.prank(bob);
        vm.expectRevert(KicaoiFarm.NoPlots.selector);
        farm.unlockPlot();
    }

    function test_UnlockPlot_RevertsOnInsufficientSeed() public {
        _fund(alice, 1 ether); // 100 SEED, cost 150
        vm.prank(alice);
        vm.expectRevert(KicaoiFarm.InsufficientSeed.selector);
        farm.unlockPlot();
    }

    function test_NewlyUnlockedPlot_IsPlantable() public {
        _fund(alice, 5 ether);
        vm.startPrank(alice);
        farm.unlockPlot(); // plot index 3 now exists
        farm.plant(3, WHEAT);
        vm.stopPrank();
        assertEq(farm.getPlot(alice, 3).cropId, WHEAT);
    }

    /* ----------------------------- admin ---------------------------- */

    function test_SetCrop_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        farm.setCrop(WHEAT, 1, 1, 1, true);
    }

    function test_SetSeedRate_OnlyOwner_AndApplies() public {
        vm.prank(owner);
        farm.setSeedRate(1000);
        _fund(alice, 1 ether);
        assertEq(farm.seedBalance(alice), 1000);
    }

    function test_WithdrawCelo_OnlyOwner_TransfersFunds() public {
        _fund(alice, 2 ether);
        assertEq(address(farm).balance, 2 ether);

        vm.prank(owner);
        farm.withdrawCelo(payable(owner), 2 ether);
        assertEq(address(farm).balance, 0);
        assertEq(owner.balance, 2 ether);
    }

    function test_WithdrawCelo_RevertsForNonOwner() public {
        _fund(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert();
        farm.withdrawCelo(payable(alice), 1 ether);
    }

    /* -------------------------- view helpers ------------------------ */

    function test_IsReady_TransitionsAtGrowTime() public {
        _fund(alice, 1 ether);
        vm.prank(alice);
        farm.plant(0, WHEAT);
        assertFalse(farm.isReady(alice, 0));
        vm.warp(block.timestamp + 5 minutes);
        assertTrue(farm.isReady(alice, 0));
    }

    function test_GetPlots_Range() public {
        _fund(alice, 1 ether);
        vm.prank(alice);
        farm.plant(1, PUMPKIN);
        KicaoiFarm.Plot[] memory ps = farm.getPlots(alice, 0, 3);
        assertEq(ps.length, 3);
        assertEq(ps[0].cropId, 0);
        assertEq(ps[1].cropId, PUMPKIN);
        assertEq(ps[2].cropId, 0);
    }

    /* ----------------------------- fuzz ----------------------------- */

    function testFuzz_BuySeeds_NeverOverflows(uint96 celo) public {
        vm.assume(celo > 0);
        vm.deal(alice, celo);
        vm.prank(alice);
        farm.buySeeds{value: celo}();
        assertEq(farm.seedBalance(alice), (uint256(celo) * 100) / 1e18);
    }

    /* ------------------------- gas snapshot ------------------------- */

    function test_Gas_PlantHarvestCycle() public {
        _fund(alice, 1 ether);
        vm.startPrank(alice);
        uint256 g0 = gasleft();
        farm.plant(0, WHEAT);
        uint256 gPlant = g0 - gasleft();
        vm.warp(block.timestamp + 5 minutes);
        uint256 g1 = gasleft();
        farm.harvest(0);
        uint256 gHarvest = g1 - gasleft();
        vm.stopPrank();
        emit log_named_uint("plant gas", gPlant);
        emit log_named_uint("harvest gas", gHarvest);
        // Sanity: well under a typical 100k budget for cheap actions.
        assertLt(gPlant, 100_000);
        assertLt(gHarvest, 100_000);
    }
}
