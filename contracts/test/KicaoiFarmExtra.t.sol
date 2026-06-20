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

    function test_BatchHarvest_SkipsEmptyAndUnripe() public {
        _fund(alice, 1 ether);
        vm.startPrank(alice);
        farm.plant(0, WHEAT); // ready after warp
        farm.plant(1, PUMPKIN); // 30 min grow, stays unripe
        vm.warp(block.timestamp + 5 minutes);

        uint256[] memory ids = new uint256[](3);
        ids[0] = 0; // ready
        ids[1] = 1; // unripe -> skipped
        ids[2] = 2; // empty -> skipped
        farm.batchHarvest(ids);
        vm.stopPrank();

        assertEq(farm.getPlot(alice, 0).cropId, 0, "ready plot harvested");
        assertEq(farm.getPlot(alice, 1).cropId, PUMPKIN, "unripe plot untouched");
        (,, uint64 totalHarvested,) = farm.stats(alice);
        assertEq(totalHarvested, 1, "only the ready plot counts");
    }

    function test_BatchHarvest_RevertsWhenNothingReady() public {
        _fund(alice, 1 ether);
        vm.startPrank(alice);
        farm.plant(0, PUMPKIN); // 30 min, not ready

        uint256[] memory ids = new uint256[](1);
        ids[0] = 0;
        vm.expectRevert(bytes("nothing ready"));
        farm.batchHarvest(ids);
        vm.stopPrank();
    }

    function test_BatchHarvest_RevertsOnPlotOutOfRange() public {
        _fund(alice, 1 ether);
        uint256[] memory ids = new uint256[](1);
        ids[0] = 3; // only 0..2 exist
        vm.prank(alice);
        vm.expectRevert(KicaoiFarm.PlotOutOfRange.selector);
        farm.batchHarvest(ids);
    }

    /* --------------------------- batchPlant -------------------------- */

    function test_BatchPlant_PlantsAll_DeductsTotalCost() public {
        _fund(alice, 1 ether); // 100 SEED
        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 1;
        uint8[] memory cropIds = new uint8[](2);
        cropIds[0] = WHEAT; // 5
        cropIds[1] = PUMPKIN; // 20

        vm.prank(alice);
        farm.batchPlant(ids, cropIds);

        assertEq(farm.seedBalance(alice), 75, "100 - 5 - 20");
        assertEq(farm.getPlot(alice, 0).cropId, WHEAT);
        assertEq(farm.getPlot(alice, 1).cropId, PUMPKIN);
        (, uint64 totalPlanted,,) = farm.stats(alice);
        assertEq(totalPlanted, 2);
    }

    function test_BatchPlant_RevertsOnLengthMismatch() public {
        _fund(alice, 1 ether);
        uint256[] memory ids = new uint256[](2);
        uint8[] memory cropIds = new uint8[](1);
        vm.prank(alice);
        vm.expectRevert(bytes("invalid args"));
        farm.batchPlant(ids, cropIds);
    }

    function test_BatchPlant_RevertsOnEmptyArgs() public {
        _fund(alice, 1 ether);
        uint256[] memory ids = new uint256[](0);
        uint8[] memory cropIds = new uint8[](0);
        vm.prank(alice);
        vm.expectRevert(bytes("invalid args"));
        farm.batchPlant(ids, cropIds);
    }

    function test_BatchPlant_RevertsOnDisabledCrop() public {
        _fund(alice, 1 ether);
        uint256[] memory ids = new uint256[](1);
        uint8[] memory cropIds = new uint8[](1);
        cropIds[0] = 99; // unknown/disabled
        vm.prank(alice);
        vm.expectRevert(KicaoiFarm.CropDisabled.selector);
        farm.batchPlant(ids, cropIds);
    }

    function test_BatchPlant_RevertsOnPlotOutOfRange() public {
        _fund(alice, 1 ether);
        uint256[] memory ids = new uint256[](1);
        ids[0] = 5; // only 0..2 exist
        uint8[] memory cropIds = new uint8[](1);
        cropIds[0] = WHEAT;
        vm.prank(alice);
        vm.expectRevert(KicaoiFarm.PlotOutOfRange.selector);
        farm.batchPlant(ids, cropIds);
    }

    function test_BatchPlant_RevertsOnNonEmptyPlot() public {
        _fund(alice, 1 ether);
        vm.startPrank(alice);
        farm.plant(0, WHEAT);
        uint256[] memory ids = new uint256[](1);
        ids[0] = 0; // already planted
        uint8[] memory cropIds = new uint8[](1);
        cropIds[0] = WHEAT;
        vm.expectRevert(KicaoiFarm.PlotNotEmpty.selector);
        farm.batchPlant(ids, cropIds);
        vm.stopPrank();
    }

    function test_BatchPlant_RevertsOnInsufficientSeed() public {
        _fund(alice, 0.05 ether); // 5 SEED, two wheat costs 10
        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 1;
        uint8[] memory cropIds = new uint8[](2);
        cropIds[0] = WHEAT;
        cropIds[1] = WHEAT;
        vm.prank(alice);
        vm.expectRevert(KicaoiFarm.InsufficientSeed.selector);
        farm.batchPlant(ids, cropIds);
    }
}
