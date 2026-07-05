import { useState } from 'react';
import { CLOUD_GUIDE, CLOUD_GUIDE_INTRO } from '@/data/cloudGuide';

interface CloudGuideModalProps {
  onClose: () => void;
}

export function CloudGuideModal({ onClose }: CloudGuideModalProps) {
  const [active, setActive] = useState(CLOUD_GUIDE[0].id);
  const provider = CLOUD_GUIDE.find((p) => p.id === active) ?? CLOUD_GUIDE[0];

  return (
    <div
      className="app-chrome fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[720px] rounded-2xl border border-line bg-panel shadow-[0_20px_60px_rgba(0,0,0,.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-[16px] font-semibold text-text">Como medir logs da cloud</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-text-dim">
              Para nuvem, meça o volume real no console do provider e sobrescreva o MB/dia da linha
              no inventário, em vez de estimar por unidade.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-line bg-panel-alt text-[18px] text-text-faint transition-colors hover:border-destructive hover:text-destructive"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="mb-5 rounded-[10px] border border-line bg-panel-alt px-4 py-3 text-[12px] leading-relaxed text-text-dim">
            {CLOUD_GUIDE_INTRO}
          </p>

          {/* Abas de provider */}
          <div className="mb-5 flex gap-2">
            {CLOUD_GUIDE.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p.id)}
                className={[
                  'flex-1 rounded-[10px] border px-3 py-2.5 text-[13px] font-semibold transition-colors',
                  active === p.id
                    ? 'border-primary bg-[color:var(--primary)]/10 text-primary'
                    : 'border-line bg-panel-alt text-text-dim hover:border-text-faint hover:text-text',
                ].join(' ')}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Conteúdo do provider ativo */}
          <p className="text-[12.5px] leading-relaxed text-text-dim">{provider.intro}</p>

          <div className="mt-4 rounded-[10px] border border-line bg-panel-alt px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-faint">
              Onde encontrar
            </div>
            <div className="mt-1 font-mono text-[12px] text-primary">{provider.path}</div>
          </div>

          <ol className="mt-4 flex list-none flex-col gap-2.5 p-0">
            {provider.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-[12.5px] leading-relaxed text-text-dim">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--primary)]/12 text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>

          {provider.query && (
            <div className="mt-4">
              <div className="mb-1.5 text-[11px] font-medium text-text-dim">
                {provider.query.label}
              </div>
              <pre className="overflow-x-auto rounded-[10px] border border-line bg-[#0b0f17] px-4 py-3 font-mono text-[11px] leading-relaxed text-[#c9d4e5]">
                {provider.query.code}
              </pre>
            </div>
          )}

          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-faint">
              Documentação oficial ({provider.name})
            </div>
            <div className="flex flex-col gap-1.5">
              {provider.docs.map((d) => (
                <a
                  key={d.url}
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
                >
                  {d.label} ↗
                </a>
              ))}
            </div>
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-text-faint">
            As telas e caminhos são mantidos pelos próprios providers e podem mudar sem aviso. Este
            guia é informativo, então sempre confirme na documentação oficial acima. Os números medidos
            são de responsabilidade do provider e do ambiente do cliente.
          </p>
        </div>
      </div>
    </div>
  );
}
