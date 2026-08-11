import { useEffect, useState } from 'react';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { decodeEventLog, isAddress } from 'viem';
import {
  POLICY_VAULT_ADDRESS,
  policyVaultAbi,
  usdc,
  saveVaultId,
  errMessage,
} from '../lib/contracts';
import { BUILDER_CODE } from '../lib/attribution';
import TxStatus from './TxStatus';

interface Props {
  onCreated: (id: number) => void;
}

export default function CreateVault({ onCreated }: Props) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const publicClient = usePublicClient();
  const [agent, setAgent] = useState('');
  const [daily, setDaily] = useState('100');
  const [perTx, setPerTx] = useState('50');
  const [approval, setApproval] = useState('50');
  const [error, setError] = useState<string | null>(null);
  const [resolvedId, setResolvedId] = useState<number | null>(null);

  const { writeContract, data: hash, isPending, reset, error: writeError } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (writeError) setError(errMessage(writeError));
  }, [writeError]);

  useEffect(() => {
    if (!isSuccess || !receipt || !address || resolvedId !== null) return;

    let vaultId: number | null = null;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: policyVaultAbi,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === 'VaultCreated') {
          vaultId = Number(decoded.args.id);
          break;
        }
      } catch {
        /* skip */
      }
    }

    (async () => {
      if (vaultId === null && publicClient) {
        const count = await publicClient.readContract({
          address: POLICY_VAULT_ADDRESS,
          abi: policyVaultAbi,
          functionName: 'vaultCount',
        });
        vaultId = Number(count) - 1;
      }
      if (vaultId === null || vaultId < 0) {
        setError('Vault created but id could not be resolved — check Basescan');
        return;
      }
      saveVaultId(address, vaultId);
      setResolvedId(vaultId);
      onCreated(vaultId);
      reset();
    })();
  }, [isSuccess, receipt, address, publicClient, onCreated, reset, resolvedId]);

  const handleCreate = () => {
    setError(null);
    setResolvedId(null);
    if (!isConnected) {
      setError('Connect wallet first');
      return;
    }
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
      return;
    }
    if (!isAddress(agent)) {
      setError('Enter a valid agent wallet address (0x…)');
      return;
    }
    writeContract({
      address: POLICY_VAULT_ADDRESS,
      abi: policyVaultAbi,
      functionName: 'createVault',
      args: [
        agent as `0x${string}`,
        usdc(daily),
        usdc(perTx),
        usdc(approval),
      ],
      chainId: base.id,
    });
  };

  if (chainId !== base.id && isConnected) {
    return (
      <section className="panel">
        <h2>Create vault</h2>
        <button
          type="button"
          className="btn-primary"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: base.id })}
        >
          {isSwitching ? 'Switching…' : 'Switch to Base to continue'}
        </button>
      </section>
    );
  }

  return (
    <section className="panel create-vault fade-up">
      <h2>Create vault</h2>
      <p className="muted">
        Onchain spending cage. Every tx is attributed with Builder Code{' '}
        <span className="mono">{BUILDER_CODE}</span>.
      </p>
      <div className="form-stack">
        <label>
          <span>Agent wallet</span>
          <input
            placeholder="0x…"
            value={agent}
            onChange={(e) => setAgent(e.target.value.trim())}
          />
        </label>
        <div className="grid-2">
          <label>
            <span>Daily limit (USDC)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={daily}
              onChange={(e) => setDaily(e.target.value)}
            />
          </label>
          <label>
            <span>Per-tx max (USDC)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={perTx}
              onChange={(e) => setPerTx(e.target.value)}
            />
          </label>
        </div>
        <label>
          <span>Human approval above (USDC)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={approval}
            onChange={(e) => setApproval(e.target.value)}
          />
        </label>
        {error && <p className="err-text">{error}</p>}
        <TxStatus hash={hash} confirming={isConfirming} success={isSuccess} />
        <button
          type="button"
          className="btn-primary"
          onClick={handleCreate}
          disabled={isPending || isConfirming || !agent}
        >
          {isPending || isConfirming ? 'Confirm in wallet…' : 'Create vault'}
        </button>
      </div>
    </section>
  );
}
