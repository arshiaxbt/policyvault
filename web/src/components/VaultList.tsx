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
  onSelect: (id: number) => void;
}

export default function VaultList({ ids, loading, onSelect }: Props) {
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

  return (
    <section className="panel">
      <h2>Your vaults</h2>
      {loading && ids.length === 0 && <p className="muted">Scanning chain…</p>}
      {!loading && ids.length === 0 && (
        <p className="muted">No vaults yet — create one above.</p>
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
                  <span className={`badge ${paused ? 'badge-paused' : 'badge-active'}`}>
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
    </section>
  );
}
