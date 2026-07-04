interface SectionCardProps {
  num: number;
  title: string;
  desc: string;
  children: React.ReactNode;
  bodyClassName?: string;
}

export function SectionCard({ num, title, desc, children, bodyClassName }: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-panel shadow-card">
      <div className="flex items-center gap-3 border-b border-line px-[22px] py-[18px]">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[9px] bg-primary text-[14px] font-semibold text-white">
          {num}
        </div>
        <div>
          <div className="text-[15px] font-semibold text-text">{title}</div>
          <div className="mt-0.5 text-[12px] leading-tight text-text-faint">{desc}</div>
        </div>
      </div>
      <div className={bodyClassName ?? 'p-[22px]'}>{children}</div>
    </section>
  );
}
