import { useEffect, useState } from 'react';
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { SignInWithBaseButton } from '@base-org/account-ui/react';
import { shortAddress } from '../lib/contracts';
import { isBaseAccountConnector } from '../lib/approve';
import { walletIconFor } from '../lib/walletIcons';
import Modal from './Modal';

export default function ConnectBar() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { connect, connectors, status, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isConnected) return;
    if (chainId === base.id) return;
    switchChain({ chainId: base.id });
  }, [isConnected, chainId, switchChain]);

  if (isReconnecting) {
    return <div className="connect-bar muted">Reconnecting…</div>;
  }

  if (isConnected && address) {
    return (
      <div className="connect-bar connected">
        {chainId !== base.id ? (
          <button
            type="button"
            className="btn-primary btn-sm"
            disabled={isSwitching}
            onClick={() => switchChain({ chainId: base.id })}
          >
            {isSwitching ? 'Switching…' : 'Switch to Base'}
          </button>
        ) : (
          <span className="mono address-chip">{shortAddress(address)}</span>
        )}
        <button type="button" className="btn-ghost" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  const busy = isConnecting || status === 'pending' || isPending;
  const baseConnector = connectors.find((c) =>
    isBaseAccountConnector(c.id, c.name)
  );
  const otherConnectors = connectors.filter(
    (c) => !isBaseAccountConnector(c.id, c.name)
  );

  return (
    <div className="connect-bar">
      <div className="connect-actions">
        {baseConnector && (
          <div className="siwb-wrap">
            <SignInWithBaseButton
              align="center"
              variant="solid"
              colorScheme="light"
              onClick={() =>
                connect({ connector: baseConnector, chainId: base.id })
              }
            />
          </div>
        )}
        <button
          type="button"
          className="btn-outline"
          disabled={busy}
          onClick={() => setOpen(true)}
        >
          Other wallets
        </button>
      </div>
      {error && <p className="err-text">{error.message.slice(0, 160)}</p>}

      <Modal open={open} title="Connect a wallet" onClose={() => setOpen(false)}>
        <p className="muted tiny">
          MetaMask, Coinbase Wallet, Safe
          {otherConnectors.some((c) => c.id === 'walletConnect')
            ? ', WalletConnect'
            : ''}
          . Switches to Base automatically.
        </p>
        <div className="wallet-list">
          {otherConnectors.map((connector) => {
            const icon = walletIconFor(
              connector.id,
              connector.name,
              connector.icon
            );
            return (
              <button
                key={connector.uid}
                type="button"
                className="wallet-option"
                disabled={busy}
                onClick={() => {
                  connect(
                    { connector, chainId: base.id },
                    { onSuccess: () => setOpen(false) }
                  );
                }}
              >
                {icon ? (
                  <img src={icon} alt="" width={28} height={28} />
                ) : (
                  <span className="wallet-fallback" aria-hidden>
                    {connector.name.slice(0, 1)}
                  </span>
                )}
                <span>{connector.name}</span>
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
