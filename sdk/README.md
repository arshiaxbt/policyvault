# @0xarshia/policyvault

Spend USDC from a [PolicyVault](https://policyvault-cyan.vercel.app) on Base under owner-set limits.

```bash
npm i @0xarshia/policyvault
```

```ts
import { createPolicyAgent } from '@0xarshia/policyvault';

const agent = createPolicyAgent({
  vaultId: 0n,
  agentPrivateKey: process.env.AGENT_PRIVATE_KEY as `0x${string}`,
});

await agent.spend('0xMerchant…', 0.05, 'exa-search');
```

Contract (Base): `0xA99bfE8D56A42C4060568C681804D08432Ab2bD5`

## If `npm i` returns 404 after publish

The package is likely **private**. Make it public:

```bash
npm access public @0xarshia/policyvault
```

Or on the website: package → **Settings** → **Package Access** → **Public**.
