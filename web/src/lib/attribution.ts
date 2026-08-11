import { Attribution } from 'ox/erc8021';
import type { Hex } from 'viem';

/** Base Builder Code from base.dev */
export const BUILDER_CODE = 'bc_aby8yf1k';

/** ERC-8021 data suffix for transaction attribution */
export const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
}) as Hex;

/** PolicyVault on Base mainnet */
export const POLICY_VAULT_ADDRESS =
  '0xA99bfE8D56A42C4060568C681804D08432Ab2bD5' as const;

/** Native USDC on Base */
export const USDC_ADDRESS =
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
