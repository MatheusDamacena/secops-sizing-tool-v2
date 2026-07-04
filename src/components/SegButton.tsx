interface SegButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** Cor de destaque quando ativo. Default: primary. */
  variant?: 'primary' | 'purple' | 'amber';
}

const VARIANT_ACTIVE: Record<NonNullable<SegButtonProps['variant']>, string> = {
  primary: 'border-primary bg-[color:var(--primary)]/10 text-primary',
  purple: 'border-purple bg-[color:var(--purple)]/10 text-purple',
  amber: 'border-amber bg-[color:var(--amber)]/10 text-amber',
};

export function SegButton({ active, onClick, children, variant = 'primary' }: SegButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex-1 rounded-lg border px-3 py-2 text-[11px] font-medium transition-colors',
        active
          ? VARIANT_ACTIVE[variant]
          : 'border-line bg-panel-alt text-text-dim hover:border-text-faint hover:text-text',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
