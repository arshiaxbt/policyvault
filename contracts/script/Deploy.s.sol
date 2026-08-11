// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PolicyVault.sol";

contract DeployScript is Script {
    // Base mainnet USDC
    address constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    function run() external {
        // Builder Code suffix — replace with your actual ERC-8021 suffix from base.dev
        bytes memory builderSuffix = hex"0780218021802180218021802180218021";

        vm.startBroadcast();
        PolicyVault vault = new PolicyVault(BASE_USDC, builderSuffix);
        vm.stopBroadcast();

        console.log("PolicyVault deployed at:", address(vault));
    }
}
