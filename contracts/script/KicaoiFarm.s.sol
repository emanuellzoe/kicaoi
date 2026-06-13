// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {KicaoiFarm} from "../src/KicaoiFarm.sol";

/// @notice Deploys KicaoiFarm. Crops + rate are seeded in the constructor, so no
///         post-deploy config is strictly required to start playing.
contract KicaoiFarmScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        KicaoiFarm farm = new KicaoiFarm();
        vm.stopBroadcast();
        console.log("KicaoiFarm deployed at:", address(farm));
        console.log("owner:", farm.owner());
        console.log("seedPerCelo:", farm.seedPerCelo());
    }
}
