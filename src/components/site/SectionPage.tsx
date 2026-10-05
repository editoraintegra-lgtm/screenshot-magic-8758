import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { sectionQuery, PAGE_SIZE } from "@/lib/articles";
import { getSection, getSub } from "@/lib/sections";
import { ArticleCard } from "./ArticleCard";
import { AdSlot } from "./AdSlot";

export function SectionPage({ section, sub, page }: { section: string; sub?: string; page: number }) {
  const { data } = useSuspenseQuery(sectionQuery(section, sub, page));
  const s = getSection(section)!;
  const subObj = getSub(section, sub);
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const [lead, ...rest] = data.items;
  const secondary = page === 1 ? rest.slice(0, 3) : [];
  const list = page === 1 ? rest.slice(3) : data.items;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="border-b-2 border-rule pb-4">
        {subObj && <Link to="/$section" params={{ section }} className="kicker">{s.name}</Link>}
        <h1 className="text-4xl font-bold md:text-6xl">{subObj?.name ?? s.name}</h1>
        {s.subs.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-wider">
            {s.subs.map((x) => (
              <li key={x.slug}>
                <Link to="/$section/$sub" params={{ section, sub: x.slug }} className={x.slug === sub ? "text-primary" : "text-muted-foreground hover:text-foreground"}>{x.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      {data.items.length === 0 && <p className="py-20 text-center text-muted-foreground">Nenhuma publicação nesta editoria ainda.</p>}

      {page === 1 && lead && (
        <section className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <ArticleCard a={lead} variant="lead" eager />
          <div className="grid content-start gap-6 lg:border-l lg:pl-8">
            {secondary.map((a) => <ArticleCard key={a.id} a={a} variant="card" />)}
          </div>
        </section>
      )}

      {list.length > 0 && (
        <section className="mt-12 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="section-rule mb-2"><h2 className="text-2xl font-semibold">Mais recentes</h2></div>
            {list.map((a) => <ArticleCard key={a.id} a={a} variant="row" />)}
          </div>
          <aside className="hidden lg:block"><AdSlot position="side" /></aside>
        </section>
      )}

      {pages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginação">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link key={p} to="." search={{ page: p }} className={`grid h-10 w-10 place-items-center border text-sm ${p === page ? "border-foreground bg-foreground text-background" : "hover:border-foreground"}`}>{p}</Link>
          ))}
        </nav>
      )}
    </div>
  );
}
