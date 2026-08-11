import type { Hash } from 'viem';

interface Props {
  hash?: Hash;
  confirming?: boolean;
  success?: boolean;
  label?: string;
}

export default function TxStatus({ hash, confirming, success, label }: Props) {
  if (!hash && !label) return null;
  return (
    <p className="tx-status">
      {label && <span>{label} </span>}
      {hash && (
        <a
          href={`https://basescan.org/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="mono link"
        >
          {hash.slice(0, 10)}…
        </a>
      )}
      {confirming ? ' · confirming…' : success ? ' · confirmed' : ''}
    </p>
  );
}
