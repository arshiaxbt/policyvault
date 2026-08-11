import { SignInWithBaseButton } from '@base-org/account-ui/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { shortAddress } from '../lib/contracts';

export default function ConnectBar() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const baseConnector = connectors.find(
    (c) => c.id === 'baseAccount' || c.name.toLowerCase().includes('base')
  );
  const injectedConnector = connectors.find(
    (c) => c.id === 'injected' || c.type === 'injected'
  );

  if (isReconnecting) {
    return <div className="connect-bar muted">Reconnecting…</div>;
  }

  if (isConnected && address) {
    return (
      <div className="connect-bar connected">
        <span className="mono address-chip">{shortAddress(address)}</span>
        <button type="button" className="btn-ghost" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  const busy = isConnecting || status === 'pending';

  return (
    <div className="connect-bar">
      <div className="connect-actions">
        {baseConnector && (
          <div className="siwb-wrap">
            <SignInWithBaseButton
              align="center"
              variant="solid"
              colorScheme="light"
              onClick={() => connect({ connector: baseConnector })}
            />
          </div>
        )}
        {injectedConnector && (
          <button
            type="button"
            className="btn-outline"
            disabled={busy}
            onClick={() => connect({ connector: injectedConnector })}
          >
            {busy ? 'Connecting…' : 'Browser wallet'}
          </button>
        )}
      </div>
      {error && <p className="err-text">{error.message.slice(0, 160)}</p>}
    </div>
  );
}
