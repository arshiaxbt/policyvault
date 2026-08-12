# PolicyVault agent runner (CLI only)

Private keys stay in your environment — never paste them into the website.

```bash
cd agent-runner
npm i
cp .env.example .env   # AGENT_PRIVATE_KEY, VAULT_ID, SPEND_TO
node spend.mjs
```

Or use the SDK directly:

```bash
npm i @0xarshia/policyvault
```

See https://policyvault-cyan.vercel.app/vaults after connecting as owner.
