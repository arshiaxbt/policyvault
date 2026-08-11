import React from 'react';

interface Props {
  vaultId: number;
}

export default function VaultDashboard({ vaultId }: Props) {
  // Mock data — in production read from contract + indexed events
  const vault = {
    agent: '0x0234...a3f9',
    balance: 450_000_000, // 6 decimals
    spentToday: 32_500_000,
    dailyLimit: 100_000_000,
    perTxLimit: 50_000_000,
    approvalThreshold: 50_000_000,
    paused: false,
  };

  const receipts = [
    { id: 1, to: '0xexa...1234', amount: 0.02, memo: 'exa-search', time: '2 min ago' },
    { id: 2, to: '0xven...5678', amount: 5.00, memo: 'venice-inference', time: '18 min ago' },
    { id: 3, to: '0xbrs...9abc', amount: 0.50, memo: 'browserbase-session', time: '1 hr ago' },
    { id: 4, to: '0xwlf...def0', amount: 0.10, memo: 'wolfram-compute', time: '3 hr ago' },
  ];

  const fmt = (n: number) => (n / 1e6).toFixed(2);
  const pct = (vault.spentToday / vault.dailyLimit) * 100;

  return (
    <div className="flex-col gap-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2>Vault #{vaultId}</h2>
            <span className="mono" style={{ color: 'var(--muted)' }}>
              Agent: {vault.agent}
            </span>
          </div>
          <span className={`badge ${vault.paused ? 'badge-paused' : 'badge-active'}`}>
            {vault.paused ? 'Paused' : 'Active'}
          </span>
        </div>

        {/* Balance + Spending bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="stat-label">Balance</div>
              <div className="stat-value">${fmt(vault.balance)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="stat-label">Spent Today</div>
              <div className="stat-value">${fmt(vault.spentToday)} / ${fmt(vault.dailyLimit)}</div>
            </div>
          </div>
          <div style={{
            marginTop: 12, height: 8, borderRadius: 4,
            background: 'var(--border)', overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${Math.min(pct, 100)}%`,
              background: pct > 80 ? 'var(--danger)' : 'var(--accent)',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Policy */}
        <div className="grid-2 mt-4">
          <div>
            <div className="stat-label">Per-Tx Max</div>
            <div className="mono">${fmt(vault.perTxLimit)}</div>
          </div>
          <div>
            <div className="stat-label">Approval Above</div>
            <div className="mono">${fmt(vault.approvalThreshold)}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button className="btn-primary">Fund Vault</button>
          <button className="btn-outline">Edit Policy</button>
          <button className="btn-danger">
            {vault.paused ? 'Unpause' : 'Pause'}
          </button>
        </div>
      </div>

      {/* Receipt Feed */}
      <div className="card">
        <h2 className="mb-2">Spending Receipts</h2>
        <div className="receipt-feed">
          {receipts.map((r) => (
            <div key={r.id} className="receipt-item">
              <div>
                <span className="mono" style={{ color: 'var(--muted)' }}>{r.to}</span>
                <span style={{ marginLeft: 12, fontSize: 13 }}>{r.memo}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="receipt-amount">-${r.amount.toFixed(2)}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{r.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
