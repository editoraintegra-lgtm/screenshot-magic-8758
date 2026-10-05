import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Facebook, Link2, Send, Twitter } from "lucide-react";
import { toast } from "sonner";
import { articleQuery, formatDate, formatTime, type Block } from "@/lib/articles";
import { labelFor, sectionName } from "@/lib/sections";
import { ArticleBody } from "@/components/site/ArticleBody";
import { Figure, VideoPlayer } from "@/components/site/Media";
import { ArticleCard, DemoTag } from "@/components/site/ArticleCard";
import { AdSlot } from "@/components/site/AdSlot";

export const Route = createFileRoute("/noticia/$slug")({
  loader: async ({ params, context }) => {
    const d = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!d) throw notFound();
    return { title: d.article.seo_title || d.article.title, description: d.article.seo_description || d.article.subtitle || "", image: d.article.cover_url };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Notícia não encontrada — Digital Jerusalem" }, { name: "robots", content: "noindex" }] };
    const meta = [
      { title: `${loaderData.title} — Digital Jerusalem` },
      { name: "description", content: loaderData.description },
      { property: "og:title", content: loaderData.title },
      { property: "og:description", content: loaderData.description },
      { property: "og:type", content: "article" },
    ];
    if (loaderData.image?.startsWith("https://")) {
      meta.push({ property: "og:image", content: loaderData.image }, { name: "twitter:image", content: loaderData.image } as never);
    }
    return { meta };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Notícia não encontrada</h1>
      <Link to="/" className="mt-6 inline-block border-b-2 border-foreground">Voltar ao início</Link>
    </div>
  ),
  component: ArticlePage,
});

function Share({ title }: { title: string }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const enc = encodeURIComponent;
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(title + " " + url)}`, Icon: Send },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, Icon: Facebook },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`, Icon: Twitter },
  ];
  return (
    <div className="flex items-center gap-2">
      <span className="mr-2 text-xs font-bold uppercase tracking-wider">Compartilhar</span>
      {links.map(({ label, href, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center border hover:border-foreground"><Icon className="h-4 w-4" /></a>
      ))}
      <button aria-label="Copiar link" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copiado"); }} className="grid h-9 w-9 place-items-center border hover:border-foreground"><Link2 className="h-4 w-4" /></button>
    </div>
  );
}

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(articleQuery(slug));
  if (!data) return null;
  const { article: a, related } = data;
  const blocks = (Array.isArray(a.body) ? a.body : []) as Block[];

  return (
    <article className="pb-10">
      {a.is_demo && (
        <div className="bg-muted py-2 text-center text-xs uppercase tracking-wider text-muted-foreground">
          Conteúdo de demonstração — não descreve fatos reais
        </div>
      )}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        {a.kind === "video" && a.video_url ? (
          <VideoPlayer url={a.video_url} title={a.title} />
        ) : a.cover_url ? (
          <Figure url={a.cover_url} alt={a.cover_alt} caption={a.cover_caption} credit={a.cover_credit} eager />
        ) : null}
      </div>

      <header className="mx-auto max-w-3xl px-4 pt-8">
        <Link to="/$section" params={{ section: a.section }} className="kicker">{labelFor(a.section, a.subsection)}</Link>
        <DemoTag show={a.is_demo} />
        <h1 className="mt-3 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">{a.title}</h1>
        {a.subtitle && <p className="mt-5 font-serif text-xl leading-snug text-muted-foreground md:text-2xl">{a.subtitle}</p>}
        <div className="mt-6 flex flex-col gap-4 border-y py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            {a.author_name && <p className="font-semibold">Por {a.author_name}</p>}
            <p className="text-muted-foreground">
              <time dateTime={a.published_at}>{formatDate(a.published_at)} · {formatTime(a.published_at)}</time> · {sectionName(a.section)}
            </p>
          </div>
          <Share title={a.title} />
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-3xl px-4">
        {a.audio_url && (
          <div className="mb-8 border p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider">Ouça</p><audio src={a.audio_url} controls preload="none" className="w-full" /></div>
        )}
        <ArticleBody blocks={blocks} />
        <div className="mt-10 border-t pt-6"><Share title={a.title} /></div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <AdSlot position="inline" />
        {related.length > 0 && (
          <section className="mt-10">
            <div className="section-rule mb-6"><h2 className="text-2xl font-semibold">Notícias relacionadas</h2></div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((r) => <ArticleCard key={r.id} a={r} />)}
            </div>
          </section>
        )}
        {related.length > 3 && (
          <section className="mt-12">
            <div className="section-rule mb-2"><h2 className="text-2xl font-semibold">Mais de {sectionName(a.section)}</h2></div>
            {related.slice(3).map((r) => <ArticleCard key={r.id} a={r} variant="row" />)}
          </section>
        )}
      </div>
    </article>
  );
}
