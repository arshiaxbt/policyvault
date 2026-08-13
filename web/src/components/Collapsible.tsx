import { useState, type ReactNode } from 'react';

interface Props {
  label: string;
  hideLabel?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function Collapsible({
  label,
  hideLabel,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="collapsible">
      <button
        type="button"
        className="btn-ghost collapsible-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? hideLabel || `Hide ${label.toLowerCase()}` : label}
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
}
