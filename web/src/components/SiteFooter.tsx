import { POLICY_VAULT_ADDRESS } from '../lib/contracts';

const REPO = 'https://github.com/arshiaxbt/policyvault';
const X = 'https://x.com/0xarshia';
const CONTRACT = `https://basescan.org/address/${POLICY_VAULT_ADDRESS}`;

function IconX() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.926L1.254 2.25H8.08l4.259 5.689L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z"
      />
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2C6.477 2 2 6.486 2 12.021c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.952 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.944.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.021C22 6.486 17.523 2 12 2z"
      />
    </svg>
  );
}

function IconContract() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5M9 13h6M9 17h6M9 9h2" strokeLinecap="round" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-links">
        <a href={X} target="_blank" rel="noreferrer" aria-label="X profile 0xarshia" title="X / @0xarshia">
          <IconX />
        </a>
        <a href={REPO} target="_blank" rel="noreferrer" aria-label="GitHub repository" title="GitHub">
          <IconGitHub />
        </a>
        <a href={CONTRACT} target="_blank" rel="noreferrer" aria-label="PolicyVault contract on Basescan" title="Contract">
          <IconContract />
        </a>
      </div>
      <p className="muted tiny">PolicyVault on Base</p>
    </footer>
  );
}
