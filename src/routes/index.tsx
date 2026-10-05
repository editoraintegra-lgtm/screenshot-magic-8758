import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { homeQuery, formatTime, type ArticleSummary } from "@/lib/articles";
import { getSection, labelFor } from "@/lib/sections";
import { ArticleCard, DemoTag } from "@/components/site/ArticleCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Newsletter } from "@/components/site/Newsletter";
import { RadioBlock } from "@/components/site/RadioBlock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Digital Jerusalem — Israel, Oriente Médio e mundo judaico" },
      { name: "description", content: "Portal jornalístico independente com notícias de Israel, Oriente Médio, mundo judaico, tecnologia, ciência e arqueologia." },
      { property: "og:title", content: "Digital Jerusalem" },
      { property: "og:description", content: "Jornalismo independente sobre Israel, Oriente Médio e mundo judaico, em português." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery()),
  component: Home,
});

function SectionHeader({ slug, title }: { slug: string; title?: string }) {
  const s = getSection(slug);
  return (
    <div className="section-rule mb-6 flex items-baseline justify-between gap-4">
      <Link to="/$section" params={{ section: slug }}><h2 className="text-2xl font-semibold md:text-3xl">{title ?? s?.name}</h2></Link>
      {s && s.subs.length > 0 && (
        <ul className="hidden gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground md:flex">
          {s.subs.map((sub) => (
            <li key={sub.slug}><Link to="/$section/$sub" params={{ section: slug, sub: sub.slug }} className="hover:text-foreground">{sub.name}</Link></li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SectionBlock({ slug, items }: { slug: string; items: ArticleSummary[] }) {
  if (!items.length) return null;
  const [lead, ...rest] = items;
  const s = getSection(slug)!;
  return (
    <section className="mt-14">
      <SectionHeader slug={slug} />
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <ArticleCard a={lead} variant="lead" />
        <div>{rest.slice(0, 4).map((a) => <ArticleCard key={a.id} a={a} variant="row" />)}</div>
      </div>
      {s.subs.length > 0 && (
        <div className="mt-8 grid gap-6 border-t pt-6 sm:grid-cols-2 lg:grid-cols-5">
          {s.subs.map((sub) => {
            const subItems = items.filter((i) => i.subsection === sub.slug).slice(0, 2);
            return (
              <div key={sub.slug}>
                <Link to="/$section/$sub" params={{ section: slug, sub: sub.slug }} className="kicker">{sub.name}</Link>
                {subItems.length ? subItems.map((a) => (
                  <Link key={a.id} to="/noticia/$slug" params={{ slug: a.slug }} className="headline mt-2 block text-base">{a.title}</Link>
                )) : <p className="mt-2 text-sm text-muted-foreground">Sem publicações recentes.</p>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Home() {
  const { data: all } = useSuspenseQuery(homeQuery());
  const by = (s: string) => all.filter((a) => a.section === s);
  const main = all.find((a) => a.is_main_headline) ?? all[0];
  const secondary = all.filter((a) => a.id !== main?.id && a.is_featured).slice(0, 4);
  const fillers = all.filter((a) => a.id !== main?.id && !secondary.includes(a));
  const sec = [...secondary, ...fillers].slice(0, 4);
  const latest = all.slice(0, 8);
  const more = all.filter((a) => a.id !== main?.id && !sec.includes(a)).slice(0, 8);
  const special = by("especial");
  const videos = by("videos");

  return (
    <div>
      <div className="border-b bg-muted/50">
        <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto px-4 py-2 text-sm">
          <span className="flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-wider text-live">
            <span className="h-2 w-2 animate-pulse rounded-full bg-live" /> Últimas
          </span>
          {latest.slice(0, 5).map((a) => (
            <Link key={a.id} to="/noticia/$slug" params={{ slug: a.slug }} className="flex shrink-0 items-center gap-2 border-l pl-4 hover:underline">
              <span className="font-bold text-primary">{formatTime(a.published_at)}</span>
              <span className="max-w-xs truncate">{a.title}</span>
              <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">{labelFor(a.section, a.subsection)}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <AdSlot position="top" />

        {main ? (
          <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <ArticleCard a={main} variant="lead" eager />
            <div className="grid content-start gap-6 lg:border-l lg:pl-8">
              {sec.map((a) => <ArticleCard key={a.id} a={a} variant="card" />)}
            </div>
          </section>
        ) : (
          <p className="py-20 text-center text-muted-foreground">Nenhuma notícia publicada ainda.</p>
        )}

        <section className="mt-14 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="section-rule mb-2"><h2 className="text-2xl font-semibold md:text-3xl">Mais notícias</h2></div>
            {more.map((a) => <ArticleCard key={a.id} a={a} variant="row" />)}
          </div>
          <aside>
            <div className="section-rule mb-2"><h2 className="text-xl font-semibold">Agora</h2></div>
            {latest.map((a) => <ArticleCard key={a.id} a={a} variant="text" />)}
            <div className="hidden lg:block"><AdSlot position="side" /></div>
          </aside>
        </section>

        <SectionBlock slug="israel" items={by("israel")} />
        <AdSlot position="inline" />
        <SectionBlock slug="oriente-medio" items={by("oriente-medio")} />
        <SectionBlock slug="mundo-judaico" items={by("mundo-judaico")} />

        <section className="mt-14 grid gap-10 md:grid-cols-3">
          {["tecnologia", "ciencia", "arqueologia"].map((slug) => {
            const items = by(slug);
            return (
              <div key={slug}>
                <SectionHeader slug={slug} />
                {items[0] ? <ArticleCard a={items[0]} variant="card" /> : <p className="text-sm text-muted-foreground">Sem publicações recentes.</p>}
                <div className="mt-4">{items.slice(1, 4).map((a) => <ArticleCard key={a.id} a={a} variant="compact" />)}</div>
              </div>
            );
          })}
        </section>
      </div>

      {special.length > 0 && (
        <section className="mt-16 bg-special text-special-foreground">
          <div className="mx-auto max-w-7xl px-4 py-14">
            <Link to="/$section" params={{ section: "especial" }} className="text-xs font-bold uppercase tracking-[0.25em] opacity-80">Especial</Link>
            <div className="mt-6 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
              <Link to="/noticia/$slug" params={{ slug: special[0].slug }} className="group">
                {special[0].cover_url && <img src={special[0].cover_url} alt={special[0].cover_alt ?? ""} loading="lazy" className="aspect-[16/9] w-full object-cover" />}
                <h3 className="headline mt-5 text-3xl md:text-5xl">{special[0].title}<DemoTag show={special[0].is_demo} /></h3>
                {special[0].subtitle && <p className="mt-3 text-lg opacity-80">{special[0].subtitle}</p>}
              </Link>
              <div className="grid content-start gap-6">
                {special.slice(1, 4).map((a) => (
                  <Link key={a.id} to="/noticia/$slug" params={{ slug: a.slug }} className="border-t border-special-foreground/20 pt-4">
                    <h4 className="headline text-xl">{a.title}</h4>
                    {a.subtitle && <p className="mt-2 text-sm opacity-75">{a.subtitle}</p>}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4">
        {videos.length > 0 && (
          <section className="mt-14">
            <SectionHeader slug="videos" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {videos.slice(0, 4).map((a) => <ArticleCard key={a.id} a={a} variant="card" />)}
            </div>
          </section>
        )}
      </div>

      <div className="mt-16"><RadioBlock items={by("radio")} /></div>

      <div className="mx-auto max-w-7xl px-4 pt-16"><Newsletter /></div>
    </div>
  );
}
