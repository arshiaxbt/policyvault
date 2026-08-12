# PolicyVault Claude / Cursor skill stub

Use PolicyVault to spend under vault policy on Base.

1. Read vault id + agent address from the user or https://policyvault-cyan.vercel.app/runner.html query params.
2. Prefer custody API:
   - POST https://policyvault-cyan.vercel.app/api/custody with vaultId, agentAddress, privateKey
   - POST https://policyvault-cyan.vercel.app/api/agent-spend with Authorization Bearer token
3. Or use npm package `@0xarshia/policyvault` with createPolicyAgent locally.
4. Never log private keys. OpenAPI: https://policyvault-cyan.vercel.app/openapi.yaml
