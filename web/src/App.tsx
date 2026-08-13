import { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import Hero from './components/Hero';
import ConnectBar from './components/ConnectBar';
import NetworkBanner from './components/NetworkBanner';
import HowItWorks from './components/HowItWorks';
import RolesFaq from './components/RolesFaq';
import SetupChecklist from './components/SetupChecklist';
import CreateVault from './components/CreateVault';
import VaultList from './components/VaultList';
import VaultDashboard from './components/VaultDashboard';
import AgentQuickstart from './components/AgentQuickstart';
import AlertsAndSetup from './components/AlertsAndSetup';
import SiteFooter from './components/SiteFooter';
import PageShell from './components/PageShell';
import { POLICY_VAULT_ADDRESS, policyVaultAbi } from './lib/contracts';
import { useOwnerVaultIds } from './hooks/useOwnerVaultIds';
import {
  matchVaultRoute,
  navigate,
  usePathRoute,
} from './hooks/usePathRoute';

export default function App() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const route = usePathRoute();
  const vaultMatch = matchVaultRoute(route);
  const { ids, loading, error, refresh } = useOwnerVaultIds(
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

  const createChecklist = useMemo(
    () => [
      { id: 'connect', label: 'Connect', done: !!isConnected },
      { id: 'vault', label: 'Create & fund', done: false },
    ],
    [isConnected]
  );

  const known =
    route === '/' ||
    route === '/how' ||
    route === '/faq' ||
    route === '/create' ||
    route === '/vaults' ||
    !!vaultMatch;

  const showConnect =
    isConnected ||
    route === '/create' ||
    route === '/vaults' ||
    !!vaultMatch ||
    route === '/';

  return (
    <div className="app">
      <div className="topbar">
        <a className="brand-link" href="/" aria-label="PolicyVault home">
          <img src="/icon.svg" alt="" className="brand-logo" width={32} height={32} />
          <span className="topbar-brand">PolicyVault</span>
        </a>
        <nav className="topbar-nav" aria-label="Main">
          {isConnected && (
            <a className={route === '/vaults' ? 'active' : undefined} href="/vaults">
              Vaults
            </a>
          )}
          <a className={route === '/create' ? 'active' : undefined} href="/create">
            Create
          </a>
          <a className={route === '/how' ? 'active' : undefined} href="/how">
            How
          </a>
          <a className={route === '/faq' ? 'active' : undefined} href="/faq">
            FAQ
          </a>
        </nav>
        {showConnect && <ConnectBar />}
      </div>

      <NetworkBanner />

      {route === '/' && (
        <>
          <Hero showConnect={false} />
          {isConnecting || isReconnecting ? (
            <p className="center-msg muted">Connecting…</p>
          ) : isConnected ? (
            <main className="workspace home-connected fade-up">
              <section className="panel home-cta-panel">
                <h2>You&apos;re connected</h2>
                <p className="muted">
                  {ids.length === 0
                    ? 'No vaults yet — create a cage for your agent.'
                    : 'Manage existing vaults or create a new cage for an agent.'}
                </p>
                <div className="home-cta-row">
                  {ids.length > 0 ? (
                    <a className="btn-primary" href="/vaults">
                      My vaults ({ids.length})
                    </a>
                  ) : (
                    <a className="btn-primary" href="/create">
                      Create vault
                    </a>
                  )}
                  {ids.length > 0 ? (
                    <a className="btn-outline" href="/create">
                      Create vault
                    </a>
                  ) : (
                    <a className="btn-outline" href="/vaults">
                      My vaults
                    </a>
                  )}
                </div>
              </section>
            </main>
          ) : (
            <main className="workspace">
              <nav className="hero-actions" aria-label="Get started">
                <a className="btn-primary" href="/create">
                  Create vault
                </a>
              </nav>
            </main>
          )}
        </>
      )}

      {route === '/how' && (
        <PageShell title="How it works" backHref="/">
          <HowItWorks defaultOpen hideTitle />
        </PageShell>
      )}

      {route === '/faq' && (
        <PageShell title="You vs your agent" backHref="/">
          <RolesFaq hideTitle />
        </PageShell>
      )}

      {route === '/create' && (
        <main className="workspace fade-up">
          <a className="btn-ghost back-link" href={isConnected ? '/vaults' : '/'}>
            ← Back
          </a>
          {isConnected && <SetupChecklist steps={createChecklist} />}
          {!isConnected ? (
            <section className="panel">
              <h2>Create vault</h2>
              <p className="muted">Connect your owner wallet to create a vault.</p>
              <ConnectBar />
            </section>
          ) : (
            <CreateVault
              onCreated={(id) => {
                refresh();
                navigate(`/vault/${id}/quickstart`);
              }}
            />
          )}
        </main>
      )}

      {route === '/vaults' && (
        <main className="workspace fade-up">
          <div className="vaults-head">
            <div>
              <h1 className="page-title">Your vaults</h1>
              <p className="muted tiny">Loaded from Base — survives cache clears.</p>
            </div>
            <div className="home-cta-row">
              {isConnected && (
                <button
                  type="button"
                  className="btn-ghost btn-sm"
                  disabled={loading}
                  onClick={refresh}
                >
                  {loading ? 'Scanning…' : 'Refresh'}
                </button>
              )}
              <a className="btn-primary" href="/create">
                Create vault
              </a>
            </div>
          </div>
          {!isConnected ? (
            <section className="panel">
              {isConnecting || isReconnecting ? (
                <p className="muted">Connecting…</p>
              ) : (
                <>
                  <p className="muted">Connect to load vaults from Base.</p>
                  <ConnectBar />
                </>
              )}
            </section>
          ) : (
            <>
              <VaultList
                ids={ids}
                loading={loading}
                error={error}
                onSelect={(id) => navigate(`/vault/${id}`)}
                hideTitle
              />
              {agentIds.length > 0 && (
                <section className="panel">
                  <h2>Agent vaults</h2>
                  <p className="muted">
                    This wallet is the agent on{' '}
                    {agentIds.map((id) => `#${id}`).join(', ')}.
                  </p>
                  <ul className="vault-list">
                    {agentIds.map((id) => (
                      <li key={`agent-${id}`}>
                        <button
                          type="button"
                          className="vault-row"
                          onClick={() => navigate(`/vault/${id}`)}
                        >
                          <span className="mono">Vault #{id}</span>
                          <span className="badge badge-active">Agent view</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </main>
      )}

      {vaultMatch?.section === 'dashboard' && (
        <main className="workspace fade-up">
          <a className="btn-ghost back-link" href="/vaults">
            ← All vaults
          </a>
          <VaultDashboard vaultId={vaultMatch.vaultId} />
        </main>
      )}

      {vaultMatch?.section === 'quickstart' && (
        <main className="workspace fade-up">
          <a className="btn-ghost back-link" href={`/vault/${vaultMatch.vaultId}`}>
            ← Vault #{vaultMatch.vaultId}
          </a>
          <AgentQuickstart vaultId={vaultMatch.vaultId} />
          <p className="muted tiny center-msg">
            Next:{' '}
            <a className="link" href={`/vault/${vaultMatch.vaultId}`}>
              open vault dashboard
            </a>{' '}
            or{' '}
            <a className="link" href="/vaults">
              all vaults
            </a>
            .
          </p>
        </main>
      )}

      {vaultMatch?.section === 'alerts' && (
        <VaultAlertsRoute vaultId={vaultMatch.vaultId} />
      )}

      {!known && (
        <PageShell title="Not found" backHref="/">
          <p className="muted">
            Unknown path.{' '}
            <a className="link" href="/">
              Go home
            </a>
            .
          </p>
        </PageShell>
      )}

      <SiteFooter />
    </div>
  );
}

function VaultAlertsRoute({ vaultId }: { vaultId: number }) {
  const { data, isLoading } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: policyVaultAbi,
    functionName: 'getVault',
    args: [BigInt(vaultId)],
  });
  const agent = data?.[1] as `0x${string}` | undefined;
  const owner = data?.[0] as `0x${string}` | undefined;

  return (
    <PageShell title="Alerts" backHref={`/vault/${vaultId}`}>
      {isLoading && <p className="muted">Loading vault…</p>}
      {!isLoading && (!agent || !owner) && (
        <p className="err-text">Vault #{vaultId} not found on chain.</p>
      )}
      {agent && owner && (
        <AlertsAndSetup vaultId={vaultId} agent={agent} owner={owner} />
      )}
    </PageShell>
  );
}
