// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {KicaoiFarm} from "../src/KicaoiFarm.sol";

/// @dev Covers batch actions, remaining admin setters, and event emissions
///      that are not exercised by KicaoiFarmTest.
contract KicaoiFarmExtraTest is Test {
    KicaoiFarm farm;

    address owner = address(0xA11CE);
    address alice = address(0xB0B);

    uint8 constant WHEAT = 1;
    uint8 constant PUMPKIN = 2;

    function setUp() public {
        vm.prank(owner);
        farm = new KicaoiFarm();
        vm.deal(alice, 100 ether);
    }

    function _fund(address who, uint256 celo) internal {
        vm.prank(who);
        farm.buySeeds{value: celo}();
    }

    /* -------------------------- batchHarvest ------------------------- */

    function test_BatchHarvest_HarvestsAllReady() public {
        _fund(alice, 1 ether); // 100 SEED, 3 plots
        vm.startPrank(alice);
        farm.plant(0, WHEAT); // -5
        farm.plant(1, WHEAT); // -5  => 90
        vm.warp(block.timestamp + 5 minutes);

        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 1;
        farm.batchHarvest(ids); // +9 +9 => 108
        vm.stopPrank();

        assertEq(farm.seedBalance(alice), 108, "90 + 9 + 9");
        assertEq(farm.getPlot(alice, 0).cropId, 0, "plot 0 cleared");
        assertEq(farm.getPlot(alice, 1).cropId, 0, "plot 1 cleared");
        (,, uint64 totalHarvested, uint256 totalSeedHarvested) = farm.stats(alice);
        assertEq(totalHarvested, 2);
        assertEq(totalSeedHarvested, 18);
    }
}
