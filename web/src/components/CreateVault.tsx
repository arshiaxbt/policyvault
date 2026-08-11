import React, { useState } from 'react';

interface Props {
  onCreated: (id: number) => void;
}

export default function CreateVault({ onCreated }: Props) {
  const [agent, setAgent] = useState('');
  const [daily, setDaily] = useState('100');
  const [perTx, setPerTx] = useState('50');
  const [approval, setApproval] = useState('50');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    // In production: call contract.createVault(agent, daily*1e6, perTx*1e6, approval*1e6)
    // Mock for now
    setTimeout(() => {
      setLoading(false);
      onCreated(0);
    }, 1500);
  };

  return (
    <div className="card">
      <h2 className="mb-2">Create New Vault</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>
        Deploy a spending cage for your AI agent. Set limits, then fund it with USDC.
      </p>
      <div className="flex-col gap-4">
        <div>
          <label style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
            Agent Wallet Address
          </label>
          <input
            placeholder="0x..."
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
          />
        </div>
        <div className="grid-2">
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
              Daily Limit (USDC)
            </label>
            <input type="number" value={daily} onChange={(e) => setDaily(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
              Per-Transaction Max (USDC)
            </label>
            <input type="number" value={perTx} onChange={(e) => setPerTx(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
            Human Approval Above (USDC)
          </label>
          <input type="number" value={approval} onChange={(e) => setApproval(e.target.value)} />
        </div>
        <button className="btn-primary mt-2" onClick={handleCreate} disabled={loading || !agent}>
          {loading ? 'Deploying...' : 'Create Vault'}
        </button>
      </div>
    </div>
  );
}
