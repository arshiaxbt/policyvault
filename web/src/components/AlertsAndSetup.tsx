import { useEffect, useMemo, useState } from 'react';
import { useWatchContractEvent } from 'wagmi';
import {
  POLICY_VAULT_ADDRESS,
  policyVaultAbi,
  formatUsdc,
  shortAddress,
} from '../lib/contracts';
import { agentSetupHttps, agentSetupUri } from '../lib/ux';
import Collapsible from './Collapsible';

interface Props {
  vaultId: number;
  agent: `0x${string}`;
  owner: `0x${string}`;
}

function alertKey(vaultId: number) {
  return `pv:alerts:${vaultId}`;
}

export default function AlertsAndSetup({ vaultId, agent, owner }: Props) {
  const [webhook, setWebhook] = useState('');
  const [telegram, setTelegram] = useState('');
  const [baseNotify, setBaseNotify] = useState(true);
  const [saved, setSaved] = useState(false);
  const [lastPing, setLastPing] = useState<string | null>(null);

  const httpsLink = useMemo(
    () =>
      agentSetupHttps({
        vaultId,
        agent,
        contract: POLICY_VAULT_ADDRESS,
      }),
    [vaultId, agent]
  );
  const deepLink = useMemo(
    () =>
      agentSetupUri({
        vaultId,
        agent,
        contract: POLICY_VAULT_ADDRESS,
      }),
    [vaultId, agent]
  );

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(httpsLink)}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(alertKey(vaultId));
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        webhook?: string;
        telegram?: string;
        baseNotify?: boolean;
      };
      setWebhook(parsed.webhook || '');
      setTelegram(parsed.telegram || '');
      setBaseNotify(parsed.baseNotify !== false);
    } catch {
      /* ignore */
    }
  }, [vaultId]);

  const save = () => {
    localStorage.setItem(
      alertKey(vaultId),
      JSON.stringify({ webhook, telegram, baseNotify })
    );
    setSaved(true);
  };

  useWatchContractEvent({
    address: POLICY_VAULT_ADDRESS,
    abi: policyVaultAbi,
    eventName: 'Spent',
    args: { id: BigInt(vaultId) },
    onLogs: async (logs) => {
      for (const log of logs) {
        const amount = (log as any).args?.amount as bigint | undefined;
        const amountUsdc = amount !== undefined ? formatUsdc(amount) : '?';
        const txHash = log.transactionHash;
        const body = {
          type: 'policyvault.spent',
          vaultId,
          amountUsdc,
          txHash,
          at: new Date().toISOString(),
        };
        setLastPing(`Spend $${amountUsdc}`);
        const cfg = JSON.parse(
          localStorage.getItem(alertKey(vaultId)) || '{}'
        ) as {
          webhook?: string;
          telegram?: string;
          baseNotify?: boolean;
        };

        if (cfg.webhook) {
          try {
            await fetch(cfg.webhook, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
              mode: 'no-cors',
            });
          } catch {
            /* best effort */
          }
        }
        if (cfg.telegram) {
          try {
            await fetch('/api/alert-telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chatId: cfg.telegram,
                text: `PolicyVault #${vaultId}: spent $${amountUsdc}\n${txHash}`,
              }),
            });
          } catch {
            /* best effort */
          }
        }
        if (cfg.baseNotify !== false && owner) {
          try {
            await fetch('/api/alert-base', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                walletAddress: owner,
                title: `Vault #${vaultId} spend`,
                message: `Agent spent $${amountUsdc}. Open vault for details.`,
                targetPath: `/vault/${vaultId}`,
              }),
            });
          } catch {
            /* best effort */
          }
        }
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('PolicyVault spend', {
            body: `Vault #${vaultId}: $${amountUsdc}`,
          });
        }
      }
    },
  });

  const enableBrowser = async () => {
    if (!('Notification' in window)) return;
    await Notification.requestPermission();
  };

  return (
    <section className="panel alerts-setup">
      <h2>Spend alerts &amp; agent setup</h2>
      <p className="muted tiny">
        Owner <span className="mono">{shortAddress(owner)}</span> · agent{' '}
        <span className="mono">{shortAddress(agent)}</span>
      </p>
      <div className="setup-grid">
        <div>
          <p className="muted tiny">Scan to open this vault&apos;s setup page:</p>
          <img className="qr" src={qrSrc} alt="Agent setup QR" width={160} height={160} />
          <div className="action-row mt-2">
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => navigator.clipboard.writeText(httpsLink)}
            >
              Copy setup link
            </button>
          </div>
        </div>
        <div className="form-stack">
          <label className="check-row">
            <input
              type="checkbox"
              checked={baseNotify}
              onChange={(e) => {
                setBaseNotify(e.target.checked);
                setSaved(false);
              }}
            />
            <span>
              Base App notifications
              <span className="muted tiny block">
                Pin PolicyVault in Base App and turn on notifications for the
                owner wallet.
              </span>
            </span>
          </label>
          <div className="action-row">
            <button type="button" className="btn-primary btn-sm" onClick={save}>
              {saved ? 'Saved' : 'Save alerts'}
            </button>
            <button type="button" className="btn-outline btn-sm" onClick={enableBrowser}>
              Enable browser alerts
            </button>
          </div>
          {lastPing && <p className="muted tiny">Last: {lastPing}</p>}

          <Collapsible label="More alert channels">
            <label>
              <span>Webhook URL (optional)</span>
              <input
                placeholder="https://hooks.example.com/…"
                value={webhook}
                onChange={(e) => {
                  setWebhook(e.target.value.trim());
                  setSaved(false);
                }}
              />
            </label>
            <label>
              <span>Telegram chat id (optional)</span>
              <input
                placeholder="123456789"
                value={telegram}
                onChange={(e) => {
                  setTelegram(e.target.value.trim());
                  setSaved(false);
                }}
              />
            </label>
            <p className="muted tiny break">
              Link: <span className="mono">{httpsLink}</span>
            </p>
            <p className="muted tiny">
              Deep link: <span className="mono">{deepLink}</span>
            </p>
          </Collapsible>
        </div>
      </div>
    </section>
  );
}
