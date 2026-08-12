import type { Address, Hex } from 'viem';
export { BUILDER_CODE, DATA_SUFFIX } from './attribution';

/** PolicyVault on Base mainnet */
export const POLICY_VAULT_ADDRESS =
  '0xA99bfE8D56A42C4060568C681804D08432Ab2bD5' as Address;

/** Native USDC on Base */
export const USDC_ADDRESS =
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address;

/** First PolicyVault deploy block on Base (inclusive log scan floor) */
export const POLICY_VAULT_DEPLOY_BLOCK = 49_827_864n;

export const policyVaultAbi = [
  {
    type: 'function',
    name: 'createVault',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_agent', type: 'address' },
      { name: '_dailyLimit', type: 'uint256' },
      { name: '_perTxLimit', type: 'uint256' },
      { name: '_approvalThreshold', type: 'uint256' },
    ],
    outputs: [{ name: 'id', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'fund',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_id', type: 'uint256' },
      { name: '_amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'setPaused',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_id', type: 'uint256' },
      { name: '_paused', type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'updatePolicy',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_id', type: 'uint256' },
      { name: '_dailyLimit', type: 'uint256' },
      { name: '_perTxLimit', type: 'uint256' },
      { name: '_approvalThreshold', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_id', type: 'uint256' },
      { name: '_amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'spend',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_id', type: 'uint256' },
      { name: '_to', type: 'address' },
      { name: '_amount', type: 'uint256' },
      { name: '_memo', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getVault',
    stateMutability: 'view',
    inputs: [{ name: '_id', type: 'uint256' }],
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'agent', type: 'address' },
      {
        name: 'policy',
        type: 'tuple',
        components: [
          { name: 'dailyLimit', type: 'uint256' },
          { name: 'perTxLimit', type: 'uint256' },
          { name: 'approvalThreshold', type: 'uint256' },
          { name: 'paused', type: 'bool' },
        ],
      },
      { name: 'balance', type: 'uint256' },
      { name: 'spentToday', type: 'uint256' },
      { name: 'dayStart', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'vaultCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getAgentVaults',
    stateMutability: 'view',
    inputs: [{ name: '_agent', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    type: 'event',
    name: 'VaultCreated',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'agent', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'Spent',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'memo', type: 'bytes', indexed: false },
    ],
  },
] as const;

export const erc20Abi = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function usdc(amount: string | number): bigint {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(n) || n < 0) return 0n;
  return BigInt(Math.round(n * 1e6));
}

export function formatUsdc(amount: bigint): string {
  return (Number(amount) / 1e6).toFixed(2);
}

export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function decodeMemo(memo: Hex | string): string {
  try {
    const hex = (memo.startsWith('0x') ? memo.slice(2) : memo) as string;
    if (!hex) return '';
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
    return new TextDecoder().decode(bytes).replace(/\0/g, '').trim();
  } catch {
    return '';
  }
}

export function vaultStorageKey(address: string): string {
  return `pv:vaults:${address.toLowerCase()}`;
}

export function loadVaultIds(address: string): number[] {
  try {
    const raw = localStorage.getItem(vaultStorageKey(address));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === 'number');
  } catch {
    return [];
  }
}

export function saveVaultIds(address: string, ids: number[]): void {
  const unique = [...new Set(ids)].sort((a, b) => a - b);
  localStorage.setItem(vaultStorageKey(address), JSON.stringify(unique));
}

export function saveVaultId(address: string, id: number): void {
  saveVaultIds(address, [...loadVaultIds(address), id]);
}

export function errMessage(e: unknown): string {
  if (!e || typeof e !== 'object') return 'Transaction failed';
  const any = e as { shortMessage?: string; message?: string };
  return (any.shortMessage || any.message || 'Transaction failed').slice(0, 200);
}
