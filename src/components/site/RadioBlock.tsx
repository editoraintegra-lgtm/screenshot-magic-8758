import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import type { ArticleSummary } from "@/lib/articles";
import { formatDateTime } from "@/lib/articles";
import { SECTIONS } from "@/lib/sections";
import { DemoTag } from "./ArticleCard";

export function RadioBlock({ items }: { items: ArticleSummary[] }) {
  const radio = SECTIONS.find((s) => s.slug === "radio")!;
  const latest = items.find((i) => i.audio_url);
  return (
    <section className="bg-special text-special-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center gap-3">
          <Radio className="h-5 w-5" />
          <Link to="/$section" params={{ section: "radio" }}><h2 className="text-3xl font-semibold">Rádio Digital Jerusalem</h2></Link>
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="border border-special-foreground/20 p-6">
            {latest ? (
              <>
                <p className="text-xs uppercase tracking-widest opacity-70">Último programa</p>
                <Link to="/noticia/$slug" params={{ slug: latest.slug }}><h3 className="headline mt-2 text-2xl">{latest.title}</h3></Link>
                <audio src={latest.audio_url!} controls preload="none" className="mt-5 w-full" />
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-widest opacity-70">Player</p>
                <p className="mt-3 text-lg">Nenhum programa publicado ainda.</p>
                <p className="mt-1 text-sm opacity-70">Os áudios publicados pela redação aparecerão aqui.</p>
              </>
            )}
          </div>
          <div>
            <ul className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
              {radio.subs.map((s) => (
                <li key={s.slug}><Link to="/$section/$sub" params={{ section: "radio", sub: s.slug }} className="inline-block border border-special-foreground/30 px-3 py-2 hover:bg-special-foreground/10">{s.name}</Link></li>
              ))}
            </ul>
            <ul className="mt-6">
              {items.slice(0, 4).map((a) => (
                <li key={a.id} className="border-t border-special-foreground/20 py-3">
                  <Link to="/noticia/$slug" params={{ slug: a.slug }} className="headline text-lg">{a.title}</Link><DemoTag show={a.is_demo} />
                  <p className="mt-1 text-xs opacity-70">{formatDateTime(a.published_at)}</p>
                </li>
              ))}
              {items.length === 0 && <li className="border-t border-special-foreground/20 py-3 text-sm opacity-70">Sem episódios publicados.</li>}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
