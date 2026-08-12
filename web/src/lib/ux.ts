/** Policy presets for normal users */
export const POLICY_PRESETS = [
  {
    id: 'research',
    label: 'Research bot',
    blurb: '$1 / tx · $10 / day',
    daily: '10',
    perTx: '1',
    approval: '1',
  },
  {
    id: 'api',
    label: 'API agent',
    blurb: '$5 / tx · $50 / day',
    daily: '50',
    perTx: '5',
    approval: '5',
  },
  {
    id: 'commerce',
    label: 'Commerce agent',
    blurb: '$25 / tx · $200 / day',
    daily: '200',
    perTx: '25',
    approval: '25',
  },
] as const;

export type PresetId = (typeof POLICY_PRESETS)[number]['id'];

/** Coinbase onramp for USDC on Base */
export const ONRAMP_URL =
  'https://pay.coinbase.com/buy/select-asset?appId=policyvault&destinationWallets=[{"address":"PLACEHOLDER","blockchains":["base"]}]';

export function onrampUrlFor(address: string): string {
  return `https://www.coinbase.com/price/usdc#buy?network=base&address=${encodeURIComponent(address)}`;
}

export function humanError(e: unknown): string {
  const raw =
    e && typeof e === 'object'
      ? String(
          (e as { shortMessage?: string; message?: string }).shortMessage ||
            (e as { message?: string }).message ||
            e
        )
      : String(e);

  const lower = raw.toLowerCase();
  if (lower.includes('user rejected') || lower.includes('denied')) {
    return 'You cancelled the wallet request.';
  }
  if (lower.includes('insufficient funds') || lower.includes('insufficient balance')) {
    return 'Not enough ETH for gas or not enough USDC in the vault/wallet.';
  }
  if (lower.includes('exceedspertx') || lower.includes('exceeds per')) {
    return 'Amount is above this vault’s per-transaction limit.';
  }
  if (lower.includes('exceedsdailylimit') || lower.includes('daily')) {
    return 'This spend would exceed today’s vault limit.';
  }
  if (lower.includes('vaultpaused') || lower.includes('paused')) {
    return 'Vault is paused. Unpause it to allow spends.';
  }
  if (lower.includes('notagent')) {
    return 'This wallet is not the agent for this vault.';
  }
  if (lower.includes('notowner')) {
    return 'Only the vault owner can do that.';
  }
  if (lower.includes('needsapproval')) {
    return 'Amount is above the human-approval threshold.';
  }
  if (lower.includes('chain') || lower.includes('network')) {
    return 'Wrong network — switch to Base and try again.';
  }
  return raw.slice(0, 180);
}

export function agentSetupUri(opts: {
  vaultId: number;
  agent: string;
  contract: string;
}): string {
  const q = new URLSearchParams({
    vault: String(opts.vaultId),
    agent: opts.agent,
    contract: opts.contract,
    chain: '8453',
  });
  return `policyvault://setup?${q.toString()}`;
}

export function toolPageUrl(
  path: string,
  vaultId: number,
  agent: string
): string {
  const q = new URLSearchParams({
    vault: String(vaultId),
    agent,
  });
  return `${path}?${q.toString()}`;
}

export function agentSetupHttps(opts: {
  vaultId: number;
  agent: string;
  contract: string;
}): string {
  return `https://policyvault-cyan.vercel.app/vault/${opts.vaultId}/alerts`;
}
