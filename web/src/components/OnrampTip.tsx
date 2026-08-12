import { onrampUrlFor } from '../lib/ux';

interface Props {
  address?: string;
}

export default function OnrampTip({ address }: Props) {
  if (!address) return null;
  return (
    <p className="onramp-tip muted tiny">
      Need USDC on Base?{' '}
      <a
        className="link"
        href={onrampUrlFor(address)}
        target="_blank"
        rel="noreferrer"
      >
        Buy USDC
      </a>{' '}
      then return here to fund your vault.
    </p>
  );
}
