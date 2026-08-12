import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import {
  baseAccount,
  coinbaseWallet,
  metaMask,
  safe,
  walletConnect,
} from 'wagmi/connectors';
import type { CreateConnectorFn } from 'wagmi';
import { DATA_SUFFIX } from './lib/attribution';

const rpcUrl =
  (import.meta.env.VITE_BASE_RPC as string | undefined)?.trim() ||
  'https://mainnet.base.org';
const wcProjectId = (import.meta.env.VITE_WC_PROJECT_ID as string | undefined)?.trim();

const connectors: CreateConnectorFn[] = [
  baseAccount({
    appName: 'PolicyVault',
      appLogoUrl: 'https://policyvault-cyan.vercel.app/icon.svg',
    }),
    metaMask({
      dappMetadata: {
        name: 'PolicyVault',
        url: 'https://policyvault-cyan.vercel.app',
        iconUrl: 'https://policyvault-cyan.vercel.app/icon.svg',
      },
    }),
    coinbaseWallet({
      appName: 'PolicyVault',
      appLogoUrl: 'https://policyvault-cyan.vercel.app/icon.svg',
      preference: 'all',
    }),
  safe(),
];

if (wcProjectId) {
  connectors.push(
    walletConnect({
      projectId: wcProjectId,
      metadata: {
        name: 'PolicyVault',
        description: 'Parental controls for AI agent wallets on Base',
        url: 'https://policyvault-cyan.vercel.app',
        icons: ['https://policyvault-cyan.vercel.app/icon.svg'],
      },
      showQrModal: true,
    })
  );
}

/**
 * Wagmi config — Base Account + MetaMask + Coinbase Wallet + Safe (+ WalletConnect if VITE_WC_PROJECT_ID).
 * ERC-8021 Builder Code via client-level dataSuffix.
 */
export const config = createConfig({
  chains: [base],
  connectors,
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
