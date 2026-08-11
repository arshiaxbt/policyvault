import { useMemo } from 'react';
import { useCapabilities } from 'wagmi';
import { base } from 'wagmi/chains';

/** EIP-5792 capabilities for Base mainnet (not the wallet's current chain). */
export function useWalletCapabilities() {
  const { data: capabilities } = useCapabilities();

  return useMemo(() => {
    const onBase = capabilities?.[base.id];
    const atomic = onBase?.atomic;
    const supportsBatching =
      atomic?.status === 'ready' || atomic?.status === 'supported';
    const supportsPaymaster =
      onBase?.paymasterService?.supported === true;
    return { supportsBatching, supportsPaymaster, capabilities };
  }, [capabilities]);
}
