import { useState } from 'react';

interface Props {
  /** When true, start collapsed (connected dashboard). Landing can expand. */
  defaultOpen?: boolean;
  compact?: boolean;
  hideTitle?: boolean;
}

export default function HowItWorks({
  defaultOpen = true,
  compact = false,
  hideTitle = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  if (compact) {
    return (
      <div className="how-toggle-wrap">
        <button
          type="button"
          className="btn-ghost how-toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Hide how it works' : 'How it works'}
        </button>
        {open && <HowBody />}
      </div>
    );
  }

  return (
    <section className="panel how-it-works fade-up">
      {!hideTitle && (
        <div className="how-head">
          <h2>How it works</h2>
        </div>
      )}
      <HowBody />
    </section>
  );
}

function HowBody() {
  return (
    <ol className={`how-steps${''}`}>
      <li>
        <strong>Connect your wallet</strong>
        <span>
          You are the <em>owner</em> — fund, set limits, pause, withdraw.
        </span>
      </li>
      <li>
        <strong>Add an agent wallet</strong>
        <span>
          Generate an agent wallet offline or paste an existing{' '}
          <span className="mono">0x…</span> address. Never paste a private key into
          this site.
        </span>
      </li>
      <li>
        <strong>Create &amp; fund</strong>
        <span>
          Set rules and deposit USDC into the vault (not into the agent wallet).
        </span>
      </li>
      <li>
        <strong>Agent spends offline</strong>
        <span>
          Use the starter snippet / SDK with the agent key on your agent machine.
        </span>
      </li>
    </ol>
  );
}
