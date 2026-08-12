import { useState } from 'react';
import { useReadContracts } from 'wagmi';
import {
  POLICY_VAULT_ADDRESS,
  policyVaultAbi,
  formatUsdc,
  shortAddress,
} from '../lib/contracts';

interface Props {
  ids: number[];
  loading?: boolean;
  error?: string | null;
  onSelect: (id: number) => void;
  onRefresh?: () => void;
  hideTitle?: boolean;
}

export default function VaultList({
  ids,
  loading,
  error,
  onSelect,
  onRefresh,
  hideTitle = false,
}: Props) {
  const [manualId, setManualId] = useState('');
  const contracts = ids.map((id) => ({
    address: POLICY_VAULT_ADDRESS,
    abi: policyVaultAbi,
    functionName: 'getVault' as const,
    args: [BigInt(id)] as const,
  }));

  const { data } = useReadContracts({
    contracts,
    query: { enabled: ids.length > 0 },
  });

  const openManual = () => {
    const n = Number(manualId.trim());
    if (!Number.isInteger(n) || n < 0) return;
    onSelect(n);
  };

  return (
    <section className="panel">
      {!hideTitle ? (
        <div className="dash-head">
          <h2>Your vaults</h2>
          {onRefresh && (
            <button
              type="button"
              className="btn-ghost btn-sm"
              disabled={loading}
              onClick={onRefresh}
            >
              {loading ? 'Scanning…' : 'Refresh'}
            </button>
          )}
        </div>
      ) : (
        onRefresh && (
          <div className="dash-head">
            <span />
            <button
              type="button"
              className="btn-ghost btn-sm"
              disabled={loading}
              onClick={onRefresh}
            >
              {loading ? 'Scanning…' : 'Refresh'}
            </button>
          </div>
        )
      )}
      {loading && ids.length === 0 && (
        <p className="muted">Loading vaults from Base…</p>
      )}
      {!loading && ids.length === 0 && !error && (
        <p className="muted">
          No vaults yet —{' '}
          <a className="link" href="/create">
            create one
          </a>
          .
        </p>
      )}
      {error && (
        <p className="err-text">
          Could not refresh from chain ({error.slice(0, 120)}). Showing cache if
          any — try Refresh, or open by id below.
        </p>
      )}
      <ul className="vault-list">
        {ids.map((id, i) => {
          const result = data?.[i];
          const vault = result?.status === 'success' ? result.result : null;
          const agent = vault?.[1];
          const policy = vault?.[2];
          const balance = vault?.[3];
          const paused = policy?.paused;

          return (
            <li key={id}>
              <button
                type="button"
                className="vault-row"
                onClick={() => onSelect(id)}
              >
                <div>
                  <span className="mono">Vault #{id}</span>
                  {agent && (
                    <span className="muted"> · {shortAddress(agent)}</span>
                  )}
                </div>
                <div className="vault-row-right">
                  <span
                    className={`badge ${paused ? 'badge-paused' : 'badge-active'}`}
                  >
                    {paused ? 'Paused' : 'Active'}
                  </span>
                  {balance !== undefined && (
                    <span className="mono">${formatUsdc(balance)}</span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="open-by-id">
        <label>
          <span className="muted tiny">Open by vault id</span>
          <div className="open-by-id-row">
            <input
              inputMode="numeric"
              placeholder="e.g. 0"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') openManual();
              }}
            />
            <button type="button" className="btn-outline btn-sm" onClick={openManual}>
              Open
            </button>
          </div>
        </label>
      </div>
    </section>
  );
}
