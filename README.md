# PolicyVault

**Parental controls for AI agent wallets on Base.**

Fund your agent with USDC. Set hard spending rules. Let it pay via x402 freely — inside the cage.

## Why

Everyone is building agents that spend. Almost nobody is the product humans trust before funding them. Base listed the missing stack: spend limits, receipts, permissions, audit trails. PolicyVault is that stack.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Human Owner │────▶│  PolicyVault.sol │◀────│   AI Agent      │
│  (fund/set)  │     │  on Base mainnet  │     │  (spend via SDK)│
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │
                    ┌──────┴──────┐
                    │   USDC      │
                    │ (Base)      │
                    └─────────────┘
```

### Core features

- **Policy Engine**: daily cap, per-tx limit, human-approval threshold, pause
- **Receipt Feed**: every spend emits an indexed `Spent` event with memo
- **ERC-8021 Builder Code**: every agent tx is attributed for Base rewards
- **Agent SDK**: one-liner to pay under policy
- **Dashboard**: human-friendly UI to create vaults, fund, monitor, pause

## Quick Start

### 1. Deploy contract (or use deployed address)

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url $BASE_RPC --broadcast --private-key $DEPLOYER_PK
```

### 2. Use the agent SDK

```typescript
import { createPolicyAgent } from '@0xarshia/policyvault';

const agent = createPolicyAgent({
  contractAddress: '0x...',
  vaultId: 0n,
  agentPrivateKey: '0x...',
});

// Spend $0.05 USDC to buy an API call
await agent.spend('0xmerchant...', 0.05, 'exa-web-search');

// Check remaining budget
const status = await agent.status();
console.log(`Remaining today: $${status.dailyLimit - status.spentToday}`);
```

### 3. Run the dashboard

```bash
cd web
npm install
npm run dev
```

## Grant Application Track

**Base Builder Grant Program — Agents / Agentic Commerce**

- Live product on Base mainnet
- x402-native agent spending
- ERC-8021 Builder Code attributed
- Monetization: SaaS + facilitation fee

## Structure

```
policyvault/
├── contracts/        # Foundry — PolicyVault.sol + tests + deploy script
├── sdk/              # TypeScript agent SDK (npm: @0xarshia/policyvault)
├── web/              # Vite + React + wagmi dashboard
└── README.md
```

## Base Ecosystem Alignment

| Base 2026 Priority | PolicyVault Fit |
|-------------------|-----------------|
| Agent infrastructure | Core product — agent spending control plane |
| x402 payments | SDK wraps x402 spend under policy |
| ERC-8021 attribution | Every tx stamped with Builder Code |
| Stablecoin payments | USDC-native, Base mainnet |
| Transaction growth | More agents funded = more attributed txs |

## License

MIT
