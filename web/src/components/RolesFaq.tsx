interface Props {
  hideTitle?: boolean;
}

export default function RolesFaq({ hideTitle = false }: Props) {
  return (
    <section className="panel roles-faq fade-up">
      {!hideTitle && <h2>You vs your agent</h2>}
      <div className="roles-grid">
        <div className="role-card">
          <h3>You (owner)</h3>
          <p>Connect wallet, fund USDC, set limits, pause, withdraw anytime.</p>
        </div>
        <div className="role-card">
          <h3>Agent (spender)</h3>
          <p>
            Separate key that can only call <span className="mono">spend</span> under
            your rules — cannot withdraw your funds.
          </p>
        </div>
      </div>

      <details className="faq">
        <summary>What happens to my money?</summary>
        <p>
          USDC sits in the PolicyVault contract on Base, tagged to your vault id.
          The agent never holds the balance. You can withdraw or pause whenever you
          are connected as owner.
        </p>
      </details>
      <details className="faq">
        <summary>Do I paste a private key into the website?</summary>
        <p>
          No. Only paste the agent&apos;s public address when creating a vault.
          Create the agent key offline (SDK, wallet app, or Foundry) — never paste
          a private key into this site.
        </p>
      </details>
      <details className="faq">
        <summary>Why do I need ETH?</summary>
        <p>
          Gas on Base. If paymaster is configured, Smart Wallet txs can be
          sponsored. Otherwise keep a little ETH in the owner and agent wallets.
        </p>
      </details>
    </section>
  );
}
