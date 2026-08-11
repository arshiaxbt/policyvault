import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import Hero from './components/Hero';
import ConnectBar from './components/ConnectBar';
import NetworkBanner from './components/NetworkBanner';
import CreateVault from './components/CreateVault';
import VaultList from './components/VaultList';
import VaultDashboard from './components/VaultDashboard';
import {
  POLICY_VAULT_ADDRESS,
  policyVaultAbi,
} from './lib/contracts';
import { BUILDER_CODE } from './lib/attribution';
import { useOwnerVaultIds } from './hooks/useOwnerVaultIds';

export default function App() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const [activeVaultId, setActiveVaultId] = useState<number | null>(null);
  const { ids, loading, refresh } = useOwnerVaultIds(
    isConnected ? address : undefined
  );

  const { data: agentVaults } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: policyVaultAbi,
    functionName: 'getAgentVaults',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const agentIds = (agentVaults ?? []).map((id) => Number(id));
  const showLanding = !isConnected && !isConnecting && !isReconnecting;

  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-brand">PolicyVault</span>
        {!showLanding && <ConnectBar />}
      </div>

      <NetworkBanner />

      {showLanding && <Hero showConnect />}

      {isConnecting && (
        <p className="center-msg muted">Connecting…</p>
      )}

      {isConnected && activeVaultId === null && (
        <main className="workspace">
          <CreateVault
            onCreated={(id) => {
              refresh();
              setActiveVaultId(id);
            }}
          />
          <VaultList
            ids={ids}
            loading={loading}
            onSelect={setActiveVaultId}
          />
          {agentIds.length > 0 && (
            <section className="panel">
              <h2>Agent vaults</h2>
              <p className="muted">
                This wallet is the agent on vault
                {agentIds.length > 1 ? 's' : ''}{' '}
                {agentIds.map((id) => `#${id}`).join(', ')}. Open as owner to
                manage, or use the SDK to <span className="mono">spend</span>.
              </p>
              <ul className="vault-list">
                {agentIds.map((id) => (
                  <li key={`agent-${id}`}>
                    <button
                      type="button"
                      className="vault-row"
                      onClick={() => setActiveVaultId(id)}
                    >
                      <span className="mono">Vault #{id}</span>
                      <span className="badge badge-active">Agent view</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      )}

      {isConnected && activeVaultId !== null && (
        <main className="workspace">
          <button
            type="button"
            className="btn-ghost back-link"
            onClick={() => setActiveVaultId(null)}
          >
            ← All vaults
          </button>
          <VaultDashboard vaultId={activeVaultId} />
        </main>
      )}

      <footer className="site-footer">
        Built on Base · Builder Code <span className="mono">{BUILDER_CODE}</span>
        <br />
        <a
          href={`https://basescan.org/address/${POLICY_VAULT_ADDRESS}`}
          target="_blank"
          rel="noreferrer"
          className="link"
        >
          PolicyVault 0xA99b…2bD5
        </a>
      </footer>
    </div>
  );
}
