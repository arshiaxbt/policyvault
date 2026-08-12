import type { ApproveMode } from '../lib/approve';

interface Props {
  mode: ApproveMode;
  onModeChange: (mode: ApproveMode) => void;
  customAllowance: string;
  onCustomChange: (value: string) => void;
  fundAmount: string;
}

export default function ApproveModePicker({
  mode,
  onModeChange,
  customAllowance,
  onCustomChange,
  fundAmount,
}: Props) {
  return (
    <div className="approve-picker">
      <span className="stat-label">USDC approve</span>
      <div className="approve-modes" role="radiogroup" aria-label="USDC approve amount">
        <label className={mode === 'exact' ? 'mode active' : 'mode'}>
          <input
            type="radio"
            name="approve-mode"
            checked={mode === 'exact'}
            onChange={() => onModeChange('exact')}
          />
          Exact (${fundAmount || '0'})
        </label>
        <label className={mode === 'unlimited' ? 'mode active' : 'mode'}>
          <input
            type="radio"
            name="approve-mode"
            checked={mode === 'unlimited'}
            onChange={() => onModeChange('unlimited')}
          />
          Unlimited
        </label>
        <label className={mode === 'custom' ? 'mode active' : 'mode'}>
          <input
            type="radio"
            name="approve-mode"
            checked={mode === 'custom'}
            onChange={() => onModeChange('custom')}
          />
          Custom
        </label>
      </div>
      {mode === 'custom' && (
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Allowance (USDC)"
          value={customAllowance}
          onChange={(e) => onCustomChange(e.target.value)}
        />
      )}
      <p className="muted tiny">
        Exact is safest. Unlimited avoids repeat approvals. Custom sets a higher
        allowance than this fund.
      </p>
    </div>
  );
}
