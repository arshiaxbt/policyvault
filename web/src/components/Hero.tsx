import ConnectBar from './ConnectBar';

interface Props {
  showConnect: boolean;
}

export default function Hero({ showConnect }: Props) {
  return (
    <header className="hero">
      <div className="hero-bg" aria-hidden />
      <p className="brand-mark">PolicyVault</p>
      <p className="hero-tagline">
        Parental controls for AI agent wallets — fund with USDC, set hard rules,
        let the agent pay inside the cage.
      </p>
      {showConnect && (
        <div className="hero-cta fade-in">
          <ConnectBar />
        </div>
      )}
    </header>
  );
}
