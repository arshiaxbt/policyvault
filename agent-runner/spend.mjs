import 'dotenv/config';
import { createPolicyAgent } from '@0xarshia/policyvault';

const vaultId = BigInt(process.env.VAULT_ID || '0');
const to = process.env.SPEND_TO;
const amount = Number(process.env.SPEND_AMOUNT || '0.01');
const key = process.env.AGENT_PRIVATE_KEY;

if (!key || !to) {
  console.error('Set AGENT_PRIVATE_KEY and SPEND_TO');
  process.exit(1);
}

const agent = createPolicyAgent({
  vaultId,
  agentPrivateKey: key,
  paymasterUrl: process.env.PAYMASTER_URL,
});

const status = await agent.status();
console.log('status', status);
const result = await agent.spend(to, amount, process.env.SPEND_MEMO || 'cli-runner');
console.log('tx', result.hash);
