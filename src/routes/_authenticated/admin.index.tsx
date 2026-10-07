import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StaffGate } from "@/components/admin/StaffGate";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/articles";
import { labelFor } from "@/lib/sections";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Painel — Digital Jerusalem" }, { name: "robots", content: "noindex" }] }),
  component: () => <StaffGate><AdminList /></StaffGate>,
});

const STATUS: Record<string, string> = { draft: "Rascunho", published: "Publicada", scheduled: "Agendada" };

function AdminList() {
  const qc = useQueryClient();
  const { data, refetch } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles")
        .select("id,slug,title,section,subsection,status,published_at,is_main_headline,is_featured,is_demo")
        .order("published_at", { ascending: false }).limit(300);
      if (error) throw error;
      return data;
    },
  });

  const update = async (id: string, patch: { is_main_headline?: boolean; is_featured?: boolean }): Promise<void> => {
    if (patch.is_main_headline) await supabase.from("articles").update({ is_main_headline: false }).eq("is_main_headline", true);
    const { error } = await supabase.from("articles").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Atualizado");
    refetch(); qc.invalidateQueries({ queryKey: ["home"] });
  };

  const removeDemo = async (): Promise<void> => {
    if (!confirm("Apagar todo o conteúdo de exemplo?")) return;
    const { error } = await supabase.from("articles").delete().eq("is_demo", true);
    if (error) { toast.error(error.message); return; }
    refetch();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Notícias</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={removeDemo}>Apagar exemplos</Button>
          <Button asChild><Link to="/admin/$id" params={{ id: "nova" }}>Nova notícia</Link></Button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">★ = manchete principal da capa · Destaque = aparece ao lado da manchete.</p>
      <div className="mt-6 divide-y border-y">
        {data?.map((a) => (
          <div key={a.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center">
            <div className="flex-1">
              <Link to="/admin/$id" params={{ id: a.id }} className="font-serif text-lg font-semibold hover:underline">{a.title}</Link>
              <p className="text-xs text-muted-foreground">{labelFor(a.section, a.subsection)} · {STATUS[a.status] ?? a.status} · {formatDateTime(a.published_at)}</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button onClick={() => update(a.id, { is_main_headline: !a.is_main_headline })} className={`border px-2 py-1 ${a.is_main_headline ? "border-primary bg-primary text-primary-foreground" : ""}`}>★ Manchete</button>
              <button onClick={() => update(a.id, { is_featured: !a.is_featured })} className={`border px-2 py-1 ${a.is_featured ? "border-primary text-primary" : ""}`}>Destaque</button>
              <Link to="/noticia/$slug" params={{ slug: a.slug }} className="border px-2 py-1">Ver</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
