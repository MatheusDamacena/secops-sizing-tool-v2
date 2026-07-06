import { useI18n } from '@/i18n/context';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  const { t } = useI18n();

  const points = [
    { title: t('help.point1Title'), body: t('help.point1') },
    { title: t('help.point2Title'), body: t('help.point2') },
    { title: t('help.point3Title'), body: t('help.point3') },
    { title: t('help.point4Title'), body: t('help.point4') },
  ];

  return (
    <div
      className="app-chrome fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] rounded-2xl border border-line bg-panel shadow-[0_20px_60px_rgba(0,0,0,.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <h2 className="text-[16px] font-semibold text-text">{t('help.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-line bg-panel-alt text-[18px] text-text-faint transition-colors hover:border-destructive hover:text-destructive"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="mb-5 rounded-[10px] border border-primary/25 bg-[color:var(--primary)]/[.06] px-4 py-3 text-[12.5px] leading-relaxed text-text-dim">
            {t('help.intro')}
          </p>

          <ol className="m-0 flex list-none flex-col gap-4 p-0">
            {points.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--primary)]/12 text-[12px] font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-text">{p.title}</div>
                  <div className="mt-0.5 text-[12px] leading-relaxed text-text-dim">{p.body}</div>
                </div>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-[10px] bg-primary px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t('help.gotIt')}
          </button>
        </div>
      </div>
    </div>
  );
}
