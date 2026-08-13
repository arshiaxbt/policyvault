import { useEffect, useRef, useState } from 'react';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useSendCalls,
  useSwitchChain,
  useWaitForCallsStatus,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { decodeEventLog, encodeFunctionData, isAddress } from 'viem';
import {
  POLICY_VAULT_ADDRESS,
  USDC_ADDRESS,
  policyVaultAbi,
  erc20Abi,
  usdc,
  formatUsdc,
  saveVaultId,
} from '../lib/contracts';
import {
  type ApproveMode,
  resolveApproveAmount,
} from '../lib/approve';
import { humanError } from '../lib/ux';
import { useWalletCapabilities } from '../hooks/useWalletCapabilities';
import ApproveModePicker from './ApproveModePicker';
import PolicyPresets from './PolicyPresets';
import OnrampTip from './OnrampTip';
import TxStatus from './TxStatus';
import Collapsible from './Collapsible';

interface Props {
  onCreated: (id: number, agentAddress: `0x${string}`) => void;
}

type Phase = 'idle' | 'create' | 'approve' | 'fund' | 'done';

export default function CreateVault({ onCreated }: Props) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const publicClient = usePublicClient();
  const { supportsBatching } = useWalletCapabilities();

  const [agent, setAgent] = useState('');
  const [daily, setDaily] = useState('100');
  const [perTx, setPerTx] = useState('50');
  const [approval, setApproval] = useState('50');
  const [fundNow, setFundNow] = useState(true);
  const [fundAmount, setFundAmount] = useState('10');
  const [approveMode, setApproveMode] = useState<ApproveMode>('exact');
  const [customAllowance, setCustomAllowance] = useState('100');
  const [presetId, setPresetId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [createdId, setCreatedId] = useState<number | null>(null);
  const processedHash = useRef<string | null>(null);

  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, data: hash, isPending, reset, error: writeError } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } =
    useWaitForTransactionReceipt({ hash });

  const {
    sendCalls,
    data: callsData,
    isPending: isBatchPending,
    error: batchError,
    reset: resetBatch,
  } = useSendCalls();
  const { isLoading: isBatchConfirming, isSuccess: isBatchSuccess } =
    useWaitForCallsStatus({ id: callsData?.id });

  useEffect(() => {
    if (writeError) {
      setError(humanError(writeError));
      setPhase('idle');
    }
  }, [writeError]);

  useEffect(() => {
    if (batchError) {
      setError(humanError(batchError));
      setPhase('idle');
    }
  }, [batchError]);

  const finish = (id: number) => {
    if (!address || !isAddress(agent)) return;
    saveVaultId(address, id);
    setCreatedId(id);
    setPhase('done');
    onCreated(id, agent as `0x${string}`);
    reset();
    resetBatch();
  };

  const runApproveAndFund = (vaultId: number) => {
    const amount = usdc(fundAmount);
    const allowanceAmt = resolveApproveAmount(
      approveMode,
      fundAmount,
      customAllowance
    );

    if (supportsBatching) {
      setPhase('fund');
      const paymasterUrl = import.meta.env.VITE_PAYMASTER_URL as string | undefined;
      sendCalls({
        chainId: base.id,
        calls: [
          {
            to: USDC_ADDRESS,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: 'approve',
              args: [POLICY_VAULT_ADDRESS, allowanceAmt],
            }),
          },
          {
            to: POLICY_VAULT_ADDRESS,
            data: encodeFunctionData({
              abi: policyVaultAbi,
              functionName: 'fund',
              args: [BigInt(vaultId), amount],
            }),
          },
        ],
        ...(paymasterUrl
          ? {
              capabilities: {
                paymasterService: { url: paymasterUrl },
              },
            }
          : {}),
      });
      return;
    }

    setPhase('approve');
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [POLICY_VAULT_ADDRESS, allowanceAmt],
      chainId: base.id,
    });
  };

  useEffect(() => {
    if (!isSuccess || !hash || processedHash.current === hash) return;
    processedHash.current = hash;

    (async () => {
      if (phase === 'create' && receipt && address) {
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
        if (vaultId === null && publicClient) {
          const count = await publicClient.readContract({
            address: POLICY_VAULT_ADDRESS,
            abi: policyVaultAbi,
            functionName: 'vaultCount',
          });
          vaultId = Number(count) - 1;
        }
        if (vaultId === null || vaultId < 0) {
          setError('Vault created but id could not be resolved');
          setPhase('idle');
          return;
        }
        setCreatedId(vaultId);
        if (fundNow && usdc(fundAmount) > 0n) {
          runApproveAndFund(vaultId);
        } else {
          finish(vaultId);
        }
        return;
      }

      if (phase === 'approve' && createdId !== null) {
        setPhase('fund');
        writeContract({
          address: POLICY_VAULT_ADDRESS,
          abi: policyVaultAbi,
          functionName: 'fund',
          args: [BigInt(createdId), usdc(fundAmount)],
          chainId: base.id,
        });
        return;
      }

      if (phase === 'fund' && createdId !== null) {
        finish(createdId);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, hash, phase, receipt, address, publicClient, createdId]);

  useEffect(() => {
    if (!isBatchSuccess || createdId === null) return;
    finish(createdId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBatchSuccess, createdId]);

  const handleCreate = () => {
    setError(null);
    setCreatedId(null);
    processedHash.current = null;
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
    if (fundNow) {
      const amount = usdc(fundAmount);
      if (amount <= 0n) {
        setError('Enter a fund amount, or turn off “Fund after create”');
        return;
      }
      if (usdcBalance !== undefined && usdcBalance < amount) {
        setError(`Insufficient USDC (wallet has $${formatUsdc(usdcBalance)})`);
        return;
      }
      if (approveMode === 'custom' && usdc(customAllowance) <= 0n) {
        setError('Enter a custom allowance');
        return;
      }
    }

    setPhase('create');
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

  const busy =
    isPending ||
    isConfirming ||
    isBatchPending ||
    isBatchConfirming ||
    phase === 'create' ||
    phase === 'approve' ||
    phase === 'fund';

  const cta =
    phase === 'create'
      ? 'Creating vault…'
      : phase === 'approve'
        ? 'Approve USDC…'
        : phase === 'fund'
          ? 'Funding…'
          : fundNow
            ? 'Create & fund vault'
            : 'Create vault';

  return (
    <section className="panel create-vault fade-up">
      <h2>Create vault</h2>
      <p className="muted">
        Cage for your AI agent. Paste the agent&apos;s public address only — never a
        private key. Create the agent wallet offline (SDK, Foundry, or your wallet
        app), then paste the address here.
      </p>
      <div className="form-stack">
        <label>
          <span>Agent wallet address</span>
          <input
            placeholder="0x…"
            value={agent}
            onChange={(e) => setAgent(e.target.value.trim())}
          />
        </label>
        <PolicyPresets
          activeId={presetId}
          onSelect={(p) => {
            setPresetId(p.id);
            setDaily(p.daily);
            setPerTx(p.perTx);
            setApproval(p.approval);
          }}
        />

        <Collapsible label="Customize limits">
          <div className="grid-2">
            <label>
              <span>Daily limit (USDC)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={daily}
                onChange={(e) => {
                  setPresetId(undefined);
                  setDaily(e.target.value);
                }}
              />
            </label>
            <label>
              <span>Per-tx max (USDC)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={perTx}
                onChange={(e) => {
                  setPresetId(undefined);
                  setPerTx(e.target.value);
                }}
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
              onChange={(e) => {
                setPresetId(undefined);
                setApproval(e.target.value);
              }}
            />
          </label>
        </Collapsible>

        <label className="check-row">
          <input
            type="checkbox"
            checked={fundNow}
            onChange={(e) => setFundNow(e.target.checked)}
          />
          <span>Fund after create (needs USDC approve)</span>
        </label>

        {fundNow && (
          <>
            <label>
              <span>Initial fund (USDC)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
            </label>
            {usdcBalance !== undefined && (
              <p className="muted tiny">
                Wallet USDC: ${formatUsdc(usdcBalance)}
              </p>
            )}
            <OnrampTip address={address} />
            <Collapsible label="Advanced approve options">
              <ApproveModePicker
                mode={approveMode}
                onModeChange={setApproveMode}
                customAllowance={customAllowance}
                onCustomChange={setCustomAllowance}
                fundAmount={fundAmount}
              />
            </Collapsible>
          </>
        )}

        {error && <p className="err-text">{error}</p>}
        <TxStatus hash={hash} confirming={isConfirming} success={isSuccess} />
        {callsData?.id && (
          <p className="tx-status muted">
            Batch{' '}
            {isBatchConfirming
              ? 'confirming…'
              : isBatchSuccess
                ? 'confirmed'
                : 'submitted'}
          </p>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={handleCreate}
          disabled={busy || !agent}
        >
          {cta}
        </button>
      </div>
    </section>
  );
}
