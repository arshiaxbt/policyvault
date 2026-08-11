# PolicyVault — Base Builder Grant Application

## Project name + one-line description

**PolicyVault** — Parental controls for AI agent wallets: fund, set hard spending rules, and let agents pay via x402 inside the cage.

## Founding team

- [Your name] — [prior companies/exits, funding raised, relevant domain expertise]

## Live product

https://policyvault-cyan.vercel.app
(also: https://policyvault-arshiags-projects.vercel.app)

Base app id meta tag live:
`<meta name="base:app_id" content="6a7af04b547e63380629409d" />`

Domain to enter on base.dev: `policyvault-cyan.vercel.app`

## Contract address on Base

`0xA99bfE8D56A42C4060568C681804D08432Ab2bD5`
https://basescan.org/address/0xA99bfE8D56A42C4060568C681804D08432Ab2bD5

## Builder Code

`bc_aby8yf1k`

## Product demo (Loom)

[Record: create vault, fund, agent spend, receipt feed, pause]

## Track

**Agents / Agentic Commerce**

## Key usage numbers

- All-time users onboarded: [fill after launch]
- Current DAU: [fill]
- Current WAU: [fill]
- All-time volume processed: [fill]
- Last 30-day volume: [fill]

## How does your product make money today?

1. **Facilitation fee**: 0.1% of USDC routed through vaults (configurable, waived during growth)
2. **Pro plan**: $49/mo for advanced policies (allowlists, webhooks, multi-sig approval, analytics export)
3. **Enterprise**: custom policy engines for agent platforms (Virtuals, Venice, BlockRun)

## 3-Month GTM Plan

### Month 1 — Awareness + Seed Users
- Deploy mainnet, register Builder Code on base.dev
- Publish "How to safely fund your AI agent" tutorial (dev.to, Base community, X)
- Integrate with 2-3 x402 seller APIs (Exa, Venice, Browserbase) for live demo agents
- Target: 50 vaults created, 200+ attributed transactions

### Month 2 — Distribution
- Ship npm SDK with one-line integration for agent frameworks (LangChain, CrewAI, Eliza)
- Partner with Base MCP ecosystem — agents using Base MCP get PolicyVault as default spending layer
- Weekly Builder Rewards posts showing real spend data
- Target: 200 vaults, 2000+ txs, featured on base.dev leaderboard

### Month 3 — Monetization + Scale
- Enable Pro plan (advanced policies, webhook alerts, CSV export)
- Launch referral program via ERC-8021 attribution splits
- Apply for Base Batches with traction data
- Target: 500+ vaults, $50k+ volume, revenue from Pro subscribers

## Builder Code

`bc_aby8yf1k` (wired into web wagmi config + SDK spends)

## Primary challenge

**User acquisition** — need distribution into agent builder communities (Virtuals ecosystem, Base MCP users, x402 sellers who want their buyers' agents to be policy-constrained).

## Most useful credits

- Privy (wallet infra for dashboard)
- AWS (indexer / event processing)
- Alchemy (RPC for mainnet reads)
