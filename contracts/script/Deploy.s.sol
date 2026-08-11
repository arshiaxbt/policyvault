// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PolicyVault.sol";

contract DeployScript is Script {
    // Base mainnet USDC
    address constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    // ERC-8021 dataSuffix for Builder Code bc_aby8yf1k
    // Attribution.toDataSuffix({ codes: ["bc_aby8yf1k"] })
    bytes constant BUILDER_SUFFIX =
        hex"62635f616279387966316b0b0080218021802180218021802180218021";

    function run() external {
        vm.startBroadcast();
        PolicyVault vault = new PolicyVault(BASE_USDC, BUILDER_SUFFIX);
        vm.stopBroadcast();

        console.log("PolicyVault deployed at:", address(vault));
        console.log("Builder Code: bc_aby8yf1k");
    }
}
