import { Link } from "@tanstack/react-router";
import { Play, Headphones } from "lucide-react";
import type { ArticleSummary } from "@/lib/articles";
import { formatDateTime, formatTime } from "@/lib/articles";
import { labelFor } from "@/lib/sections";

type Variant = "lead" | "card" | "compact" | "row" | "text";

export function DemoTag({ show }: { show: boolean }) {
  if (!show) return null;
  return <span className="ml-2 border border-muted-foreground/40 px-1 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">Exemplo</span>;
}

function Thumb({ a, className = "", eager = false }: { a: ArticleSummary; className?: string; eager?: boolean }) {
  if (!a.cover_url) return null;
  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      <img src={a.cover_url} alt={a.cover_alt ?? ""} loading={eager ? "eager" : "lazy"} className="h-full w-full object-cover" />
      {a.kind === "video" && <span className="absolute bottom-2 left-2 grid h-9 w-9 place-items-center rounded-full bg-foreground/80 text-background"><Play className="h-4 w-4 fill-current" /></span>}
      {a.kind === "audio" && <span className="absolute bottom-2 left-2 grid h-9 w-9 place-items-center rounded-full bg-foreground/80 text-background"><Headphones className="h-4 w-4" /></span>}
    </div>
  );
}

export function ArticleCard({ a, variant = "card", eager }: { a: ArticleSummary; variant?: Variant; eager?: boolean }) {
  const link = { to: "/noticia/$slug" as const, params: { slug: a.slug } };
  const kicker = <p className="kicker">{labelFor(a.section, a.subsection)}<DemoTag show={a.is_demo} /></p>;

  if (variant === "lead") {
    return (
      <article>
        <Link {...link}><Thumb a={a} eager={eager} className="aspect-[16/10]" /></Link>
        <div className="mt-4">
          {kicker}
          <Link {...link}><h2 className="headline mt-2 text-3xl md:text-5xl">{a.title}</h2></Link>
          {a.subtitle && <p className="mt-3 text-lg text-muted-foreground">{a.subtitle}</p>}
          <p className="mt-3 text-xs text-muted-foreground">{formatDateTime(a.published_at)}</p>
        </div>
      </article>
    );
  }
  if (variant === "row") {
    return (
      <article className="grid grid-cols-[1fr_7rem] gap-4 border-b py-4 sm:grid-cols-[1fr_12rem]">
        <div>
          {kicker}
          <Link {...link}><h3 className="headline mt-1 text-lg sm:text-xl">{a.title}</h3></Link>
          {a.subtitle && <p className="mt-1 hidden text-sm text-muted-foreground sm:block">{a.subtitle}</p>}
          <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(a.published_at)}</p>
        </div>
        <Link {...link}><Thumb a={a} className="aspect-[4/3]" /></Link>
      </article>
    );
  }
  if (variant === "compact") {
    return (
      <article className="border-t py-3 first:border-t-0">
        {kicker}
        <Link {...link}><h3 className="headline mt-1 text-base">{a.title}</h3></Link>
      </article>
    );
  }
  if (variant === "text") {
    return (
      <article className="flex gap-3 border-b py-3">
        <span className="w-12 shrink-0 pt-0.5 text-xs font-bold text-primary">{formatTime(a.published_at)}</span>
        <div>
          <Link {...link}><h3 className="headline text-base">{a.title}</h3></Link>
          <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">{labelFor(a.section, a.subsection)}</p>
        </div>
      </article>
    );
  }
  return (
    <article>
      <Link {...link}><Thumb a={a} className="aspect-[3/2]" /></Link>
      <div className="mt-3">
        {kicker}
        <Link {...link}><h3 className="headline mt-1 text-xl">{a.title}</h3></Link>
        <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(a.published_at)}</p>
      </div>
    </article>
  );
}
