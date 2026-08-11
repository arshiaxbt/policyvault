import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { baseAccount, injected } from 'wagmi/connectors';
import { DATA_SUFFIX } from './lib/attribution';

const rpcUrl = import.meta.env.VITE_BASE_RPC as string | undefined;

/**
 * Wagmi config — Base Account (Smart Wallet) + injected EOAs.
 * ERC-8021 Builder Code via client-level dataSuffix.
 * @see https://docs.base.org/apps/quickstart/build-app
 * @see https://docs.base.org/apps/builder-codes/app-developers
 */
export const config = createConfig({
  chains: [base],
  connectors: [
    baseAccount({
      appName: 'PolicyVault',
      appLogoUrl: 'https://policyvault-cyan.vercel.app/icon.svg',
    }),
    injected(),
  ],
  transports: {
    [base.id]: http(rpcUrl),
  },
  dataSuffix: DATA_SUFFIX,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
