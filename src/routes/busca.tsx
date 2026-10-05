import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { searchQuery } from "@/lib/articles";
import { ArticleCard } from "@/components/site/ArticleCard";

export const Route = createFileRoute("/busca")({
  validateSearch: z.object({ q: z.string().optional(), ordem: z.enum(["relevance", "date"]).optional() }),
  head: () => ({
    meta: [
      { title: "Busca — Digital Jerusalem" },
      { name: "description", content: "Pesquise notícias por palavra, manchete, editoria ou autor no Digital Jerusalem." },
      { property: "og:title", content: "Busca — Digital Jerusalem" },
      { property: "og:description", content: "Pesquise notícias no Digital Jerusalem." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "", ordem = "relevance" } = Route.useSearch();
  const navigate = useNavigate({ from: "/busca" });
  const [term, setTerm] = useState(q);
  const { data, isFetching } = useQuery({ ...searchQuery(q, ordem), enabled: !!q.trim() });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl font-bold">Busca</h1>
      <form onSubmit={(e) => { e.preventDefault(); navigate({ search: { q: term, ordem } }); }} className="mt-6 flex border-b-2 border-rule">
        <input autoFocus value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Palavra, manchete, editoria ou autor" className="flex-1 bg-transparent py-3 font-serif text-2xl outline-none" />
        <button className="px-4 text-sm font-bold uppercase tracking-wider">Buscar</button>
      </form>
      {q && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{isFetching ? "Buscando…" : `${data?.length ?? 0} resultado(s) para “${q}”`}</span>
          <div className="flex gap-3">
            {(["relevance", "date"] as const).map((o) => (
              <button key={o} onClick={() => navigate({ search: { q, ordem: o } })} className={ordem === o ? "font-bold text-foreground" : ""}>
                {o === "relevance" ? "Relevância" : "Data"}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4">{data?.map((a) => <ArticleCard key={a.id} a={a} variant="row" />)}</div>
    </div>
  );
}
