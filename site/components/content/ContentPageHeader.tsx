/**
 * Cabeçalho padrão das páginas institucionais de conteúdo (rodapé) — usa a
 * mesma identidade visual (eyebrow em wine-bright + título font-display)
 * do restante do site (ver Collection.tsx, Section.tsx).
 */
type ContentPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function ContentPageHeader({ eyebrow, title, description }: ContentPageHeaderProps) {
  return (
    <header className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wine-bright">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl uppercase tracking-tight text-bone sm:text-5xl">
        {title}
      </h1>
      {description && <p className="mt-4 text-base text-slate-400 sm:text-lg">{description}</p>}
    </header>
  );
}
