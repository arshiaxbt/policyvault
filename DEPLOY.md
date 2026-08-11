# Deployment Guide

## Prerequisites

- Private key with ETH on Base mainnet for gas
- Base mainnet RPC URL (e.g. from Alchemy, Infura, or public)

## 1. Deploy Smart Contract

```bash
cd contracts

# Set environment
export BASE_RPC="https://mainnet.base.org"
export DEPLOYER_PK="0x..."  # your deployer private key

# Deploy
forge script script/Deploy.s.sol \
  --rpc-url $BASE_RPC \
  --broadcast \
  --private-key $DEPLOYER_PK \
  --verify \
  --etherscan-api-key $BASESCAN_KEY
```

Note the deployed address from output.

## 2. Register Builder Code

1. Go to https://base.dev
2. Register your app → get Builder Code
3. Update `builderCodeSuffix` in Deploy.s.sol with your actual ERC-8021 suffix
4. Update SDK config with Builder Code suffix

## 3. Deploy Frontend

```bash
cd web
npm install
npm run build
# Deploy dist/ to Vercel, Cloudflare Pages, or Netlify
```

## 4. Configure SDK

```bash
cd sdk
npm install
npm run build
```

Publish to npm as `@policyvault/sdk` or use locally.

## 5. Run Demo Agent

```typescript
import { createPolicyAgent } from '@policyvault/sdk';

const agent = createPolicyAgent({
  contractAddress: '0x<DEPLOYED_ADDRESS>',
  vaultId: 0n,
  agentPrivateKey: '0x<AGENT_PK>',
  builderCodeSuffix: '0x<YOUR_BUILDER_CODE_SUFFIX>',
});

// Agent autonomously buys API calls under policy
const result = await agent.spend('0xexa_address', 0.02, 'web-search');
console.log('Tx:', result.hash);
```
