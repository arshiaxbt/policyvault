import { useEffect, useRef, useState } from 'react';
import {
  useAccount,
  useChainId,
  useReadContract,
  useSendCalls,
  useSwitchChain,
  useWaitForCallsStatus,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { encodeFunctionData } from 'viem';
import {
  POLICY_VAULT_ADDRESS,
  USDC_ADDRESS,
  policyVaultAbi,
  erc20Abi,
  usdc,
  formatUsdc,
  shortAddress,
  errMessage,
} from '../lib/contracts';
import { useWalletCapabilities } from '../hooks/useWalletCapabilities';
import ReceiptFeed from './ReceiptFeed';
import TxStatus from './TxStatus';

interface Props {
  vaultId: number;
}

export default function VaultDashboard({ vaultId }: Props) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { supportsBatching } = useWalletCapabilities();

  const [fundAmount, setFundAmount] = useState('10');
  const [withdrawAmount, setWithdrawAmount] = useState('5');
  const [daily, setDaily] = useState('');
  const [perTx, setPerTx] = useState('');
  const [approval, setApproval] = useState('');
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState<'idle' | 'approve' | 'fund'>('idle');
  const [error, setError] = useState<string | null>(null);

  const {
    data: vault,
    refetch,
    isLoading,
    isError,
  } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: policyVaultAbi,
    functionName: 'getVault',
    args: [BigInt(vaultId)],
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, POLICY_VAULT_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const {
    writeContract,
    data: hash,
    isPending,
    reset,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const processedHash = useRef<string | null>(null);

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
      setError(errMessage(writeError));
      setStep('idle');
    }
  }, [writeError]);

  useEffect(() => {
    if (batchError) setError(errMessage(batchError));
  }, [batchError]);

  useEffect(() => {
    if (!isSuccess || !hash || processedHash.current === hash) return;
    processedHash.current = hash;

    if (step === 'approve') {
      refetchAllowance().then(() => {
        setStep('fund');
        writeContract({
          address: POLICY_VAULT_ADDRESS,
          abi: policyVaultAbi,
          functionName: 'fund',
          args: [BigInt(vaultId), usdc(fundAmount)],
          chainId: base.id,
        });
      });
      return;
    }
    setStep('idle');
    setEditing(false);
    reset();
    refetch();
    refetchAllowance();
  }, [
    isSuccess,
    hash,
    step,
    vaultId,
    fundAmount,
    writeContract,
    reset,
    refetch,
    refetchAllowance,
  ]);

  useEffect(() => {
    if (!isBatchSuccess) return;
    setStep('idle');
    resetBatch();
    refetch();
    refetchAllowance();
  }, [isBatchSuccess, resetBatch, refetch, refetchAllowance]);

  useEffect(() => {
    if (!vault || editing) return;
    const policy = vault[2];
    setDaily((Number(policy.dailyLimit) / 1e6).toString());
    setPerTx((Number(policy.perTxLimit) / 1e6).toString());
    setApproval((Number(policy.approvalThreshold) / 1e6).toString());
  }, [vault, editing]);

  const ensureBase = () => {
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
      return false;
    }
    return true;
  };

  const handleFund = () => {
    setError(null);
    if (!ensureBase()) return;
    const amount = usdc(fundAmount);
    if (amount <= 0n) {
      setError('Enter a positive USDC amount');
      return;
    }
    if (usdcBalance !== undefined && usdcBalance < amount) {
      setError(`Insufficient USDC (wallet has $${formatUsdc(usdcBalance)})`);
      return;
    }

    if (supportsBatching) {
      setStep('fund');
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [POLICY_VAULT_ADDRESS, amount],
      });
      const fundData = encodeFunctionData({
        abi: policyVaultAbi,
        functionName: 'fund',
        args: [BigInt(vaultId), amount],
      });
      sendCalls({
        chainId: base.id,
        calls: [
          { to: USDC_ADDRESS, data: approveData },
          { to: POLICY_VAULT_ADDRESS, data: fundData },
        ],
      });
      return;
    }

    if (allowance !== undefined && allowance >= amount) {
      setStep('fund');
      writeContract({
        address: POLICY_VAULT_ADDRESS,
        abi: policyVaultAbi,
        functionName: 'fund',
        args: [BigInt(vaultId), amount],
        chainId: base.id,
      });
      return;
    }
    setStep('approve');
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [POLICY_VAULT_ADDRESS, amount],
      chainId: base.id,
    });
  };

  const handlePause = (paused: boolean) => {
    setError(null);
    if (!ensureBase()) return;
    setStep('idle');
    writeContract({
      address: POLICY_VAULT_ADDRESS,
      abi: policyVaultAbi,
      functionName: 'setPaused',
      args: [BigInt(vaultId), paused],
      chainId: base.id,
    });
  };

  const handleWithdraw = () => {
    setError(null);
    if (!ensureBase()) return;
    const amount = usdc(withdrawAmount);
    if (amount <= 0n) {
      setError('Enter a positive withdraw amount');
      return;
    }
    writeContract({
      address: POLICY_VAULT_ADDRESS,
      abi: policyVaultAbi,
      functionName: 'withdraw',
      args: [BigInt(vaultId), amount],
      chainId: base.id,
    });
  };

  const handleUpdatePolicy = () => {
    setError(null);
    if (!ensureBase()) return;
    writeContract({
      address: POLICY_VAULT_ADDRESS,
      abi: policyVaultAbi,
      functionName: 'updatePolicy',
      args: [BigInt(vaultId), usdc(daily), usdc(perTx), usdc(approval)],
      chainId: base.id,
    });
  };

  if (isLoading) {
    return <div className="panel">Loading vault #{vaultId}…</div>;
  }

  if (isError || !vault) {
    return (
      <div className="panel">
        <p className="err-text">
          Could not load vault #{vaultId}. It may not exist onchain yet.
        </p>
      </div>
    );
  }

  const [owner, agent, policy, balance, spentToday] = vault;
  const isOwner =
    !!address && owner.toLowerCase() === address.toLowerCase();
  const pct =
    policy.dailyLimit > 0n
      ? Number((spentToday * 10000n) / policy.dailyLimit) / 100
      : 0;

  const busy =
    isPending || isConfirming || isBatchPending || isBatchConfirming || isSwitching;

  const fundLabel = supportsBatching
    ? busy && step !== 'idle'
      ? 'Batching…'
      : 'Fund vault'
    : step === 'approve'
      ? 'Approve USDC…'
      : step === 'fund'
        ? 'Funding…'
        : busy
          ? 'Confirm…'
          : 'Fund vault';

  return (
    <div className="dash-stack fade-up">
      <section className="panel">
        <div className="dash-head">
          <div>
            <h2>Vault #{vaultId}</h2>
            <p className="mono muted">Agent {shortAddress(agent)}</p>
            <p className="mono muted subtle">Owner {shortAddress(owner)}</p>
          </div>
          <span className={`badge ${policy.paused ? 'badge-paused' : 'badge-active'}`}>
            {policy.paused ? 'Paused' : 'Active'}
          </span>
        </div>

        <div className="balance-block">
          <div>
            <div className="stat-label">Balance</div>
            <div className="stat-value">${formatUsdc(balance)}</div>
          </div>
          <div className="text-right">
            <div className="stat-label">Spent today</div>
            <div className="stat-value sm">
              ${formatUsdc(spentToday)} / ${formatUsdc(policy.dailyLimit)}
            </div>
          </div>
        </div>
        <div className="spend-track" aria-hidden>
          <div
            className="spend-fill"
            style={{
              width: `${Math.min(pct, 100)}%`,
              background: pct > 80 ? 'var(--danger)' : 'var(--accent)',
            }}
          />
        </div>

        <div className="grid-2 policy-grid">
          <div>
            <div className="stat-label">Per-tx max</div>
            <div className="mono">${formatUsdc(policy.perTxLimit)}</div>
          </div>
          <div>
            <div className="stat-label">Approval above</div>
            <div className="mono">${formatUsdc(policy.approvalThreshold)}</div>
          </div>
        </div>

        {!isOwner && (
          <p className="warn-text">
            Connected wallet is not the vault owner — actions are disabled.
          </p>
        )}

        {isOwner && (
          <>
            <div className="action-row">
              <label className="inline-field">
                <span>Fund (USDC)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn-primary"
                onClick={handleFund}
                disabled={busy}
              >
                {fundLabel}
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => handlePause(!policy.paused)}
                disabled={busy}
              >
                {policy.paused ? 'Unpause' : 'Pause'}
              </button>
            </div>
            {usdcBalance !== undefined && (
              <p className="muted tiny">
                Wallet USDC: ${formatUsdc(usdcBalance)}
                {supportsBatching ? ' · Smart Wallet batching on' : ''}
              </p>
            )}

            <div className="action-row">
              <label className="inline-field">
                <span>Withdraw (USDC)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn-outline"
                onClick={handleWithdraw}
                disabled={busy}
              >
                Withdraw
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEditing((v) => !v)}
                disabled={busy}
              >
                {editing ? 'Cancel edit' : 'Edit policy'}
              </button>
            </div>

            {editing && (
              <div className="form-stack edit-policy">
                <div className="grid-2">
                  <label>
                    <span>Daily limit</span>
                    <input
                      type="number"
                      value={daily}
                      onChange={(e) => setDaily(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Per-tx max</span>
                    <input
                      type="number"
                      value={perTx}
                      onChange={(e) => setPerTx(e.target.value)}
                    />
                  </label>
                </div>
                <label>
                  <span>Approval threshold</span>
                  <input
                    type="number"
                    value={approval}
                    onChange={(e) => setApproval(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleUpdatePolicy}
                  disabled={busy}
                >
                  Save policy
                </button>
              </div>
            )}
          </>
        )}

        {error && <p className="err-text">{error}</p>}
        <TxStatus
          hash={hash}
          confirming={isConfirming}
          success={isSuccess}
        />
        {callsData?.id && (
          <p className="tx-status muted">
            Batch {isBatchConfirming ? 'confirming…' : isBatchSuccess ? 'confirmed' : 'submitted'}
          </p>
        )}
      </section>

      <ReceiptFeed vaultId={vaultId} />
    </div>
  );
}
