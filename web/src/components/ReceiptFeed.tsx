import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import type { Hash, Hex } from 'viem';
import {
  POLICY_VAULT_ADDRESS,
  POLICY_VAULT_DEPLOY_BLOCK,
  policyVaultAbi,
  formatUsdc,
  shortAddress,
  decodeMemo,
} from '../lib/contracts';

interface Receipt {
  to: `0x${string}`;
  amount: bigint;
  memo: string;
  txHash: Hash;
  blockNumber: bigint;
}

interface Props {
  vaultId: number;
}

export default function ReceiptFeed({ vaultId }: Props) {
  const publicClient = usePublicClient();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const logs = await publicClient.getLogs({
          address: POLICY_VAULT_ADDRESS,
          event: policyVaultAbi.find(
            (x) => x.type === 'event' && x.name === 'Spent'
          ) as any,
          args: { id: BigInt(vaultId) },
          fromBlock: POLICY_VAULT_DEPLOY_BLOCK,
          toBlock: 'latest',
        });

        if (cancelled) return;

        const parsed: Receipt[] = logs
          .map((log) => {
            const args = (log as any).args as {
              to?: `0x${string}`;
              amount?: bigint;
              memo?: Hex;
            };
            if (!args?.to || args.amount === undefined) return null;
            return {
              to: args.to,
              amount: args.amount,
              memo: decodeMemo(args.memo || '0x'),
              txHash: log.transactionHash as Hash,
              blockNumber: log.blockNumber ?? 0n,
            };
          })
          .filter((r): r is Receipt => r !== null)
          .reverse();

        setReceipts(parsed);
      } catch {
        if (!cancelled) setReceipts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient, vaultId]);

  return (
    <section className="panel">
      <h2>Spending receipts</h2>
      {loading && (
        <div className="empty-state compact">
          <p className="muted">Loading receipts…</p>
        </div>
      )}
      {!loading && receipts.length === 0 && (
        <div className="empty-state compact">
          <h3>No spends yet</h3>
          <p className="muted">
            When your agent calls <span className="mono">spend</span>, receipts
            show up here from on-chain events.
          </p>
          <a className="btn-outline btn-sm" href={`/vault/${vaultId}/quickstart`}>
            Agent SDK snippet
          </a>
        </div>
      )}
      <div className="receipt-feed">
        {receipts.map((r) => (
          <div key={`${r.txHash}-${r.to}`} className="receipt-row">
            <div>
              <span className="mono muted">{shortAddress(r.to)}</span>
              {r.memo && <span className="memo">{r.memo}</span>}
            </div>
            <div className="receipt-meta">
              <span className="receipt-amount">−${formatUsdc(r.amount)}</span>
              <a
                className="mono link"
                href={`https://basescan.org/tx/${r.txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                tx
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
