# Deployment Guide

## Live (Base mainnet)

| Item | Value |
|------|--------|
| App | https://policyvault-cyan.vercel.app |
| Contract | [`0xA99bfE8D56A42C4060568C681804D08432Ab2bD5`](https://basescan.org/address/0xA99bfE8D56A42C4060568C681804D08432Ab2bD5) |
| Deploy tx | [`0x1baa578e978e066110ae7cbd6262fcbb89c5b34af792f55cb4f684a944e72339`](https://basescan.org/tx/0x1baa578e978e066110ae7cbd6262fcbb89c5b34af792f55cb4f684a944e72339) |
| Builder Code | `bc_aby8yf1k` |
| ERC-8021 suffix | `0x62635f616279387966316b0b0080218021802180218021802180218021` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## Redeploy contract

```bash
cd contracts
export BASE_RPC="https://mainnet.base.org"
export DEPLOYER_PK="0x..."

forge script script/Deploy.s.sol \
  --rpc-url $BASE_RPC \
  --broadcast \
  --private-key $DEPLOYER_PK
```

## Frontend

```bash
cd web
npm install
npm run build
# Deploy dist/ via Vercel
```

Builder Code attribution is applied at the Wagmi client level (`src/lib/attribution.ts` + `src/main.tsx`).

## Vercel env (server)

| Var | Purpose |
|-----|---------|
| `TELEGRAM_BOT_TOKEN` | Optional Telegram spend alerts |
| `BASE_NOTIFICATIONS_API_KEY` | Base Dashboard API key → in-app spend pings |
| `BASE_APP_URL` | App URL registered on Base Dashboard (default `https://policyvault-cyan.vercel.app`) |
| `BASE_RPC` / `VITE_BASE_RPC` | Base RPC |
| `VITE_PAYMASTER_URL` | Optional gas sponsorship |
| `VITE_WC_PROJECT_ID` | Optional WalletConnect |

## Agent SDK

```typescript
import { createPolicyAgent, POLICY_VAULT_ADDRESS } from '@0xarshia/policyvault';

const agent = createPolicyAgent({
  vaultId: 0n,
  agentPrivateKey: '0x...',
  // Builder Code bc_aby8yf1k appended by default
});

await agent.spend('0xmerchant...', 0.05, 'exa-web-search');
```
