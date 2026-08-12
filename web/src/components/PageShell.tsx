import type { ReactNode } from 'react';

interface Props {
  title: string;
  backHref?: string;
  children: ReactNode;
}

export default function PageShell({ title, backHref = '/', children }: Props) {
  return (
    <main className="workspace tool-page fade-up">
      <a className="btn-ghost back-link" href={backHref}>
        ← Back
      </a>
      <h1 className="page-title">{title}</h1>
      {children}
    </main>
  );
}
