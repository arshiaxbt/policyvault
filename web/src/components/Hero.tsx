import ConnectBar from './ConnectBar';

interface Props {
  showConnect: boolean;
}

export default function Hero({ showConnect }: Props) {
  return (
    <header className="hero">
      <div className="hero-bg" aria-hidden />
      <div className="hero-brand">
        <img src="/icon.svg" alt="" className="hero-logo" width={72} height={72} />
        <p className="brand-mark">PolicyVault</p>
      </div>
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
