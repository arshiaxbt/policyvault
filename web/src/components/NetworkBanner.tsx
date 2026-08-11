import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';

export default function NetworkBanner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === base.id) return null;

  return (
    <div className="network-banner" role="status">
      <span>Wrong network — PolicyVault runs on Base.</span>
      <button
        type="button"
        className="btn-primary btn-sm"
        disabled={isPending}
        onClick={() => switchChain({ chainId: base.id })}
      >
        {isPending ? 'Switching…' : 'Switch to Base'}
      </button>
    </div>
  );
}
