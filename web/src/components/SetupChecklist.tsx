interface Step {
  id: string;
  label: string;
  done: boolean;
}

interface Props {
  steps: Step[];
}

export default function SetupChecklist({ steps }: Props) {
  const done = steps.filter((s) => s.done).length;
  return (
    <div className="setup-inline fade-up" aria-label="Setup progress">
      <span className="setup-inline-label">
        Setup <span className="muted">{done}/{steps.length}</span>
      </span>
      <ol className="setup-inline-steps">
        {steps.map((s) => (
          <li key={s.id} className={s.done ? 'done' : ''}>
            <span className="setup-dot" aria-hidden>
              {s.done ? '✓' : ''}
            </span>
            <span>{s.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
