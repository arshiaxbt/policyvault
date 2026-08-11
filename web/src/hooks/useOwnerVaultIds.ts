import { useCallback, useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import {
  POLICY_VAULT_ADDRESS,
  POLICY_VAULT_DEPLOY_BLOCK,
  policyVaultAbi,
  loadVaultIds,
  saveVaultIds,
} from '../lib/contracts';

/** Owner vault ids from VaultCreated logs + localStorage cache. */
export function useOwnerVaultIds(owner?: `0x${string}`) {
  const publicClient = usePublicClient();
  const [ids, setIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!owner || !publicClient) {
      setIds([]);
      return;
    }
    setLoading(true);
    setError(null);
    const cached = loadVaultIds(owner);
    setIds(cached);

    try {
      const logs = await publicClient.getLogs({
        address: POLICY_VAULT_ADDRESS,
        event: policyVaultAbi.find((x) => x.type === 'event' && x.name === 'VaultCreated') as any,
        args: { owner },
        fromBlock: POLICY_VAULT_DEPLOY_BLOCK,
        toBlock: 'latest',
      });

      const fromLogs = logs
        .map((l) => {
          const id = (l as { args?: { id?: bigint } }).args?.id;
          return id !== undefined ? Number(id) : null;
        })
        .filter((n): n is number => n !== null);

      const merged = [...new Set([...cached, ...fromLogs])].sort((a, b) => a - b);
      saveVaultIds(owner, merged);
      setIds(merged);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || 'Failed to load vaults');
      // keep cached
    } finally {
      setLoading(false);
    }
  }, [owner, publicClient]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ids, loading, error, refresh, setIds };
}
