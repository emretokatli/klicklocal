'use client';

type OptionChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function OptionChip({ label, selected, onClick }: OptionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
        selected
          ? 'border-primary bg-primary/10 font-medium text-on-surface'
          : 'border-white/10 bg-transparent text-on-surface-variant hover:border-white/20 hover:text-on-surface'
      }`}
    >
      {label}
    </button>
  );
}

type OptionSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function OptionSection({ title, children }: OptionSectionProps) {
  return (
    <section className="space-y-3 border-t border-white/10 pt-5 first:border-t-0 first:pt-0">
      <h2 className="text-sm font-medium text-on-surface">{title}</h2>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </section>
  );
}
