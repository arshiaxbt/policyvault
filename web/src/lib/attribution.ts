import { Attribution } from 'ox/erc8021';
import type { Hex } from 'viem';

/** Builder Code from base.dev → Settings → Builder Code */
export const BUILDER_CODE = 'bc_aby8yf1k';

/**
 * ERC-8021 attribution suffix.
 * Appended to calldata so Base attributes volume to this app.
 * @see https://docs.base.org/apps/builder-codes/app-developers
 */
export const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
}) as Hex;
