// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "forge-std/interfaces/IERC20.sol";

/// @title PolicyVault — Parental controls for agent wallets on Base
/// @notice Fund an agent with USDC. Set hard spending rules. Agent pays via x402 inside the cage.
contract PolicyVault {
    // ─── Types ───────────────────────────────────────────────────────────────
    struct Policy {
        uint256 dailyLimit;          // max USDC (6 decimals) per day
        uint256 perTxLimit;          // max per single tx
        uint256 approvalThreshold;   // above this → needs human approval
        bool paused;
    }

    struct Vault {
        address owner;               // human who funds & sets policy
        address agent;               // agent wallet allowed to spend
        Policy policy;
        uint256 balance;
        uint256 spentToday;
        uint256 dayStart;            // timestamp of current day window
    }

    // ─── State ───────────────────────────────────────────────────────────────
    IERC20 public immutable usdc;
    uint256 public vaultCount;
    mapping(uint256 => Vault) public vaults;
    mapping(address => uint256[]) public agentVaults; // agent → vault ids

    // ERC-8021 Builder Code suffix (appended offchain, tracked here for receipts)
    bytes public builderCodeSuffix;

    // ─── Events ──────────────────────────────────────────────────────────────
    event VaultCreated(uint256 indexed id, address indexed owner, address indexed agent);
    event Funded(uint256 indexed id, uint256 amount);
    event Spent(uint256 indexed id, address indexed to, uint256 amount, bytes memo);
    event PolicyUpdated(uint256 indexed id);
    event Paused(uint256 indexed id, bool paused);
    event Withdrawn(uint256 indexed id, uint256 amount);

    // ─── Errors ──────────────────────────────────────────────────────────────
    error NotOwner();
    error NotAgent();
    error VaultPaused();
    error ExceedsPerTx();
    error ExceedsDailyLimit();
    error NeedsApproval();
    error InsufficientBalance();

    constructor(address _usdc, bytes memory _builderCodeSuffix) {
        usdc = IERC20(_usdc);
        builderCodeSuffix = _builderCodeSuffix;
    }

    // ─── Owner actions ───────────────────────────────────────────────────────
    function createVault(
        address _agent,
        uint256 _dailyLimit,
        uint256 _perTxLimit,
        uint256 _approvalThreshold
    ) external returns (uint256 id) {
        id = vaultCount++;
        Vault storage v = vaults[id];
        v.owner = msg.sender;
        v.agent = _agent;
        v.policy = Policy({
            dailyLimit: _dailyLimit,
            perTxLimit: _perTxLimit,
            approvalThreshold: _approvalThreshold,
            paused: false
        });
        v.dayStart = _startOfDay();
        agentVaults[_agent].push(id);
        emit VaultCreated(id, msg.sender, _agent);
    }

    function fund(uint256 _id, uint256 _amount) external {
        Vault storage v = vaults[_id];
        if (v.owner != msg.sender) revert NotOwner();
        usdc.transferFrom(msg.sender, address(this), _amount);
        v.balance += _amount;
        emit Funded(_id, _amount);
    }

    function updatePolicy(uint256 _id, uint256 _dailyLimit, uint256 _perTxLimit, uint256 _approvalThreshold) external {
        Vault storage v = vaults[_id];
        if (v.owner != msg.sender) revert NotOwner();
        v.policy.dailyLimit = _dailyLimit;
        v.policy.perTxLimit = _perTxLimit;
        v.policy.approvalThreshold = _approvalThreshold;
        emit PolicyUpdated(_id);
    }

    function setPaused(uint256 _id, bool _paused) external {
        Vault storage v = vaults[_id];
        if (v.owner != msg.sender) revert NotOwner();
        v.policy.paused = _paused;
        emit Paused(_id, _paused);
    }

    function withdraw(uint256 _id, uint256 _amount) external {
        Vault storage v = vaults[_id];
        if (v.owner != msg.sender) revert NotOwner();
        if (v.balance < _amount) revert InsufficientBalance();
        v.balance -= _amount;
        usdc.transfer(msg.sender, _amount);
        emit Withdrawn(_id, _amount);
    }

    // ─── Agent actions ───────────────────────────────────────────────────────
    /// @notice Agent spends from vault. Called by agent or relayer.
    function spend(uint256 _id, address _to, uint256 _amount, bytes calldata _memo) external {
        Vault storage v = vaults[_id];
        if (v.agent != msg.sender) revert NotAgent();
        if (v.policy.paused) revert VaultPaused();
        if (_amount > v.policy.perTxLimit) revert ExceedsPerTx();
        if (_amount > v.policy.approvalThreshold) revert NeedsApproval();

        _resetDayIfNeeded(v);
        if (v.spentToday + _amount > v.policy.dailyLimit) revert ExceedsDailyLimit();
        if (v.balance < _amount) revert InsufficientBalance();

        v.spentToday += _amount;
        v.balance -= _amount;
        usdc.transfer(_to, _amount);

        emit Spent(_id, _to, _amount, _memo);
    }

    // ─── Views ───────────────────────────────────────────────────────────────
    function getVault(uint256 _id) external view returns (
        address owner, address agent, Policy memory policy,
        uint256 balance, uint256 spentToday, uint256 dayStart
    ) {
        Vault storage v = vaults[_id];
        return (v.owner, v.agent, v.policy, v.balance, v.spentToday, v.dayStart);
    }

    function getAgentVaults(address _agent) external view returns (uint256[] memory) {
        return agentVaults[_agent];
    }

    // ─── Internal ────────────────────────────────────────────────────────────
    function _resetDayIfNeeded(Vault storage v) internal {
        uint256 today = _startOfDay();
        if (today > v.dayStart) {
            v.dayStart = today;
            v.spentToday = 0;
        }
    }

    function _startOfDay() internal view returns (uint256) {
        return (block.timestamp / 1 days) * 1 days;
    }
}
