// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PolicyVault.sol";

contract MockUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract PolicyVaultTest is Test {
    PolicyVault vault;
    MockUSDC usdc;
    address owner = address(0x1);
    address agent = address(0x2);
    address merchant = address(0x3);

    function setUp() public {
        usdc = new MockUSDC();
        vault = new PolicyVault(address(usdc), hex"");

        usdc.mint(owner, 10_000e6);
        vm.prank(owner);
        usdc.approve(address(vault), type(uint256).max);
    }

    function test_createAndFund() public {
        vm.prank(owner);
        uint256 id = vault.createVault(agent, 100e6, 50e6, 50e6);
        assertEq(id, 0);

        vm.prank(owner);
        vault.fund(id, 500e6);

        (,, PolicyVault.Policy memory p, uint256 bal,,) = vault.getVault(id);
        assertEq(bal, 500e6);
        assertEq(p.dailyLimit, 100e6);
    }

    function test_agentSpend() public {
        vm.prank(owner);
        uint256 id = vault.createVault(agent, 100e6, 50e6, 50e6);
        vm.prank(owner);
        vault.fund(id, 500e6);

        vm.prank(agent);
        vault.spend(id, merchant, 10e6, "buy-api-call");

        (,,, uint256 bal, uint256 spent,) = vault.getVault(id);
        assertEq(bal, 490e6);
        assertEq(spent, 10e6);
        assertEq(usdc.balanceOf(merchant), 10e6);
    }

    function test_exceedsPerTx() public {
        vm.prank(owner);
        uint256 id = vault.createVault(agent, 100e6, 50e6, 50e6);
        vm.prank(owner);
        vault.fund(id, 500e6);

        vm.prank(agent);
        vm.expectRevert(PolicyVault.ExceedsPerTx.selector);
        vault.spend(id, merchant, 60e6, "");
    }

    function test_exceedsDailyLimit() public {
        vm.prank(owner);
        uint256 id = vault.createVault(agent, 100e6, 50e6, 50e6);
        vm.prank(owner);
        vault.fund(id, 500e6);

        vm.prank(agent);
        vault.spend(id, merchant, 50e6, "");
        vm.prank(agent);
        vault.spend(id, merchant, 50e6, "");

        vm.prank(agent);
        vm.expectRevert(PolicyVault.ExceedsDailyLimit.selector);
        vault.spend(id, merchant, 10e6, "");
    }

    function test_paused() public {
        vm.prank(owner);
        uint256 id = vault.createVault(agent, 100e6, 50e6, 50e6);
        vm.prank(owner);
        vault.fund(id, 500e6);
        vm.prank(owner);
        vault.setPaused(id, true);

        vm.prank(agent);
        vm.expectRevert(PolicyVault.VaultPaused.selector);
        vault.spend(id, merchant, 10e6, "");
    }

    function test_onlyOwnerCanFund() public {
        vm.prank(owner);
        uint256 id = vault.createVault(agent, 100e6, 50e6, 50e6);

        vm.prank(agent);
        vm.expectRevert(PolicyVault.NotOwner.selector);
        vault.fund(id, 100e6);
    }

    function test_onlyAgentCanSpend() public {
        vm.prank(owner);
        uint256 id = vault.createVault(agent, 100e6, 50e6, 50e6);
        vm.prank(owner);
        vault.fund(id, 500e6);

        vm.prank(owner);
        vm.expectRevert(PolicyVault.NotAgent.selector);
        vault.spend(id, merchant, 10e6, "");
    }
}
