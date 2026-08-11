import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import CreateVault from './components/CreateVault';
import VaultDashboard from './components/VaultDashboard';

export default function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [activeVaultId, setActiveVaultId] = useState<number | null>(null);

  return (
    <div className="container">
      {/* Hero */}
      <div className="hero">
        <h1>PolicyVault</h1>
        <p>
          Parental controls for AI agent wallets. Fund your agent with USDC,
          set hard spending rules, and let it pay freely — inside the cage.
        </p>
        <div className="stats mt-4">
          <div>
            <div className="stat-value">x402</div>
            <div className="stat-label">Native</div>
          </div>
          <div>
            <div className="stat-value">Base</div>
            <div className="stat-label">Mainnet</div>
          </div>
          <div>
            <div className="stat-value">ERC-8021</div>
            <div className="stat-label">Attributed</div>
          </div>
        </div>
      </div>

      {/* Connect */}
      <div className="flex items-center justify-between mt-6 mb-2">
        <h2>Dashboard</h2>
        {isConnected ? (
          <div className="flex items-center gap-2">
            <span className="mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button className="btn-outline" onClick={() => disconnect()}>Disconnect</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={() => connect({ connector: injected() })}>
            Connect Wallet
          </button>
        )}
      </div>

      {!isConnected && (
        <div className="card mt-4" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <h3>Connect your wallet to create or manage agent vaults</h3>
        </div>
      )}

      {isConnected && activeVaultId === null && (
        <div className="flex-col gap-6 mt-4">
          <CreateVault onCreated={(id) => setActiveVaultId(id)} />
          <VaultList onSelect={setActiveVaultId} />
        </div>
      )}

      {isConnected && activeVaultId !== null && (
        <div className="mt-4">
          <button className="btn-outline mb-2" onClick={() => setActiveVaultId(null)}>
            ← Back to vaults
          </button>
          <VaultDashboard vaultId={activeVaultId} />
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: 80, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        Built on Base · Builder Code <span className="mono">bc_aby8yf1k</span>
        <br />
        PolicyVault{' '}
        <a
          href="https://basescan.org/address/0xA99bfE8D56A42C4060568C681804D08432Ab2bD5"
          style={{ color: 'var(--accent)' }}
          target="_blank"
          rel="noreferrer"
        >
          0xA99b…2bD5
        </a>
      </footer>
    </div>
  );
}

function VaultList({ onSelect }: { onSelect: (id: number) => void }) {
  // Placeholder — in production read from contract events
  const mockVaults = [
    { id: 0, agent: '0x02...a3f', balance: '450.00', status: 'active' },
    { id: 1, agent: '0x07...b12', balance: '120.50', status: 'paused' },
  ];

  return (
    <div className="card mt-4">
      <h2 className="mb-2">Your Vaults</h2>
      {mockVaults.map((v) => (
        <div key={v.id} className="receipt-item" style={{ cursor: 'pointer' }} onClick={() => onSelect(v.id)}>
          <div>
            <span className="mono">Vault #{v.id}</span>
            <span style={{ marginLeft: 12 }}>
              Agent: <span className="mono">{v.agent}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${v.status === 'active' ? 'badge-active' : 'badge-paused'}`}>
              {v.status}
            </span>
            <span className="mono">${v.balance}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
