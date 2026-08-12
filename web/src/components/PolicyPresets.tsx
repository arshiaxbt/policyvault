import { POLICY_PRESETS, type PresetId } from '../lib/ux';

interface Props {
  activeId?: string;
  onSelect: (preset: (typeof POLICY_PRESETS)[number]) => void;
}

export default function PolicyPresets({ activeId, onSelect }: Props) {
  return (
    <div className="presets">
      <span className="stat-label">Quick presets</span>
      <div className="preset-row">
        {POLICY_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`preset-chip${activeId === p.id ? ' active' : ''}`}
            onClick={() => onSelect(p)}
          >
            <strong>{p.label}</strong>
            <span>{p.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export type { PresetId };
