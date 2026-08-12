import { useCallback, useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import type { Address } from 'viem';
import {
  POLICY_VAULT_ADDRESS,
  policyVaultAbi,
  loadVaultIds,
  saveVaultIds,
} from '../lib/contracts';

const ZERO = '0x0000000000000000000000000000000000000000';

/**
 * Owner vault ids from on-chain vaultCount + getVault.
 * localStorage is only a cache — clearing browser data must not lose vaults.
 */
export function useOwnerVaultIds(owner?: `0x${string}`) {
  const publicClient = usePublicClient();
  const [ids, setIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!owner || !publicClient) {
      setIds([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const cached = loadVaultIds(owner);
    if (cached.length) setIds(cached);

    const ownerLc = owner.toLowerCase();

    try {
      const count = await publicClient.readContract({
        address: POLICY_VAULT_ADDRESS,
        abi: policyVaultAbi,
        functionName: 'vaultCount',
      });
      const n = Number(count);
      const fromChain: number[] = [];
      const BATCH = 40;

      for (let start = 0; start < n; start += BATCH) {
        const end = Math.min(start + BATCH, n);
        const batch = await Promise.all(
          Array.from({ length: end - start }, (_, i) => {
            const id = BigInt(start + i);
            return publicClient
              .readContract({
                address: POLICY_VAULT_ADDRESS,
                abi: policyVaultAbi,
                functionName: 'getVault',
                args: [id],
              })
              .then((v) => ({ id: Number(id), owner: v[0] as Address }))
              .catch(() => null);
          })
        );
        for (const row of batch) {
          if (!row || row.owner === ZERO) continue;
          if (row.owner.toLowerCase() === ownerLc) fromChain.push(row.id);
        }
      }

      saveVaultIds(owner, fromChain);
      setIds(fromChain);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'shortMessage' in e
          ? String((e as { shortMessage?: string }).shortMessage)
          : e instanceof Error
            ? e.message
            : 'Failed to load vaults';
      setError(msg);
      if (cached.length) setIds(cached);
      else setIds([]);
    } finally {
      setLoading(false);
    }
  }, [owner, publicClient]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ids, loading, error, refresh, setIds };
}
