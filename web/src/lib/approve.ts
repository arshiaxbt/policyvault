import { maxUint256 } from 'viem';
import { usdc } from './contracts';

export type ApproveMode = 'exact' | 'unlimited' | 'custom';

/** Resolve USDC allowance to request for a fund amount. */
export function resolveApproveAmount(
  mode: ApproveMode,
  fundAmount: string | number,
  customAllowance: string
): bigint {
  if (mode === 'unlimited') return maxUint256;
  if (mode === 'custom') {
    const custom = usdc(customAllowance);
    const needed = usdc(fundAmount);
    return custom > needed ? custom : needed;
  }
  return usdc(fundAmount);
}

export function isBaseAccountConnector(id: string, name: string): boolean {
  const n = name.toLowerCase();
  return id === 'baseAccount' || n.includes('base account') || n === 'base';
}
