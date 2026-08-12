import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { POLICY_VAULT_ADDRESS, policyVaultAbi, shortAddress } from '../lib/contracts';

interface Props {
  vaultId: number;
  agentAddress?: string | null;
}

export default function AgentQuickstart({ vaultId, agentAddress }: Props) {
  const [copied, setCopied] = useState(false);
  const { data } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: policyVaultAbi,
    functionName: 'getVault',
    args: [BigInt(vaultId)],
    query: { enabled: !agentAddress },
  });
  const agent = agentAddress || (data?.[1] as string | undefined) || '0x…';

  const snippet = `npm i @0xarshia/policyvault

import { createPolicyAgent } from '@0xarshia/policyvault';

// Run ONLY on your agent machine — set AGENT_PRIVATE_KEY in the environment.
// Never paste that key into a website.
const agent = createPolicyAgent({
  contractAddress: '${POLICY_VAULT_ADDRESS}',
  vaultId: ${vaultId}n,
  agentPrivateKey: process.env.AGENT_PRIVATE_KEY, // agent ${shortAddress(agent)}
});

await agent.spend('0xMerchantOrApi…', 0.05, 'my-agent-purchase');
console.log(await agent.status());
`;

  useEffect(() => {
    setCopied(false);
  }, [vaultId, agent]);

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
  };

  return (
    <section className="panel agent-quickstart fade-up">
      <h2>Next: let your agent spend</h2>
      <p className="muted">
        Vault <span className="mono">#{vaultId}</span>
        {agent.startsWith('0x') && agent.length === 42 && (
          <>
            {' '}
            · agent <span className="mono">{shortAddress(agent)}</span>
          </>
        )}
        . Use the SDK on your machine — this site never asks for a private key.
      </p>
      <ol className="quick-steps">
        <li>Create the agent key offline (wallet app / Foundry / viem).</li>
        <li>
          Install{' '}
          <a
            className="link"
            href="https://www.npmjs.com/package/@0xarshia/policyvault"
            target="_blank"
            rel="noreferrer"
          >
            @0xarshia/policyvault
          </a>
          .
        </li>
        <li>
          Set <span className="mono">AGENT_PRIVATE_KEY</span> in your shell env and run
          the snippet.
        </li>
      </ol>
      <pre className="code-block">
        <code>{snippet}</code>
      </pre>
      <button type="button" className="btn-outline" onClick={copy}>
        {copied ? 'Copied snippet' : 'Copy starter snippet'}
      </button>
    </section>
  );
}
