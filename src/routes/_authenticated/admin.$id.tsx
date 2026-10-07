import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StaffGate } from "@/components/admin/StaffGate";
import { Button } from "@/components/ui/button";
import { SECTIONS, getSection } from "@/lib/sections";
import { uploadMedia } from "@/lib/upload";
import type { Block } from "@/lib/articles";

export const Route = createFileRoute("/_authenticated/admin/$id")({
  head: () => ({ meta: [{ title: "Editar notícia — Digital Jerusalem" }, { name: "robots", content: "noindex" }] }),
  component: () => <StaffGate><Editor /></StaffGate>,
});

type Form = {
  title: string; subtitle: string; slug: string; section: string; subsection: string; kind: string;
  author_name: string; cover_url: string; cover_alt: string; cover_caption: string; cover_credit: string;
  video_url: string; audio_url: string; seo_title: string; seo_description: string;
  status: string; published_at: string; is_main_headline: boolean; is_featured: boolean; body: Block[];
};

const empty: Form = {
  title: "", subtitle: "", slug: "", section: "israel", subsection: "", kind: "article", author_name: "",
  cover_url: "", cover_alt: "", cover_caption: "", cover_credit: "", video_url: "", audio_url: "",
  seo_title: "", seo_description: "", status: "draft", published_at: toLocal(new Date().toISOString()),
  is_main_headline: false, is_featured: false, body: [{ type: "p", text: "" }],
};

function toLocal(iso: string) {
  const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
const slugify = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);

const inp = "w-full border border-input bg-background px-3 py-2 text-sm";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1 text-sm"><span className="font-semibold">{label}</span>{children}</label>;
}

function Upload({ onDone, accept = "image/*", label = "Enviar arquivo" }: { onDone: (url: string) => void; accept?: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <label className="inline-flex cursor-pointer items-center border px-3 py-2 text-xs font-semibold hover:bg-muted">
      {busy ? "Enviando…" : label}
      <input type="file" accept={accept} className="hidden" onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setBusy(true);
        try { onDone(await uploadMedia(f)); } catch (err) { toast.error((err as Error).message); }
        setBusy(false);
      }} />
    </label>
  );
}

const BLOCK_LABELS: Record<Block["type"], string> = {
  p: "Parágrafo", h2: "Intertítulo", quote: "Citação", list: "Lista", image: "Foto", gallery: "Galeria",
  video: "Vídeo", audio: "Áudio", embed: "Incorporar (mapa, gráfico, post)",
};
const newBlock = (t: Block["type"]): Block => {
  switch (t) {
    case "list": return { type: "list", items: [""] };
    case "gallery": return { type: "gallery", images: [] };
    case "image": case "video": case "audio": case "embed": return { type: t, url: "" } as Block;
    default: return { type: t, text: "" } as Block;
  }
};

function BlockEditor({ b, set }: { b: Block; set: (b: Block) => void }) {
  switch (b.type) {
    case "p": case "h2":
      return <textarea className={inp} rows={b.type === "p" ? 4 : 1} value={b.text} onChange={(e) => set({ ...b, text: e.target.value })}
        placeholder={b.type === "p" ? "Texto. Use **negrito**, *itálico* e [link](https://...)" : "Intertítulo"} />;
    case "quote":
      return <div className="grid gap-2"><textarea className={inp} value={b.text} onChange={(e) => set({ ...b, text: e.target.value })} placeholder="Citação" /><input className={inp} value={b.cite ?? ""} onChange={(e) => set({ ...b, cite: e.target.value })} placeholder="Autor da citação" /></div>;
    case "list":
      return <textarea className={inp} rows={4} value={b.items.join("\n")} onChange={(e) => set({ ...b, items: e.target.value.split("\n") })} placeholder="Um item por linha" />;
    case "image":
      return (
        <div className="grid gap-2">
          {b.url && <img src={b.url} alt="" className="max-h-48 object-contain" />}
          <div className="flex gap-2"><input className={inp} value={b.url} onChange={(e) => set({ ...b, url: e.target.value })} placeholder="Endereço da imagem" /><Upload onDone={(url) => set({ ...b, url })} /></div>
          <input className={inp} value={b.caption ?? ""} onChange={(e) => set({ ...b, caption: e.target.value })} placeholder="Legenda" />
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inp} value={b.credit ?? ""} onChange={(e) => set({ ...b, credit: e.target.value })} placeholder="Crédito" />
            <input className={inp} value={b.alt ?? ""} onChange={(e) => set({ ...b, alt: e.target.value })} placeholder="Descrição da imagem (acessibilidade/SEO)" />
          </div>
        </div>
      );
    case "gallery":
      return (
        <div className="grid gap-2">
          {b.images.map((im, i) => (
            <div key={i} className="grid grid-cols-[4rem_1fr_1fr_auto] items-center gap-2">
              <img src={im.url} alt="" className="h-12 w-16 object-cover" />
              <input className={inp} value={im.caption ?? ""} placeholder="Legenda" onChange={(e) => set({ ...b, images: b.images.map((x, k) => k === i ? { ...x, caption: e.target.value } : x) })} />
              <input className={inp} value={im.credit ?? ""} placeholder="Crédito" onChange={(e) => set({ ...b, images: b.images.map((x, k) => k === i ? { ...x, credit: e.target.value } : x) })} />
              <button onClick={() => set({ ...b, images: b.images.filter((_, k) => k !== i) })}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <Upload label="Adicionar foto à galeria" onDone={(url) => set({ ...b, images: [...b.images, { url }] })} />
        </div>
      );
    case "video": case "audio": case "embed":
      return (
        <div className="grid gap-2">
          <div className="flex gap-2">
            <input className={inp} value={b.url} onChange={(e) => set({ ...b, url: e.target.value })}
              placeholder={b.type === "video" ? "Link do YouTube/Vimeo ou arquivo de vídeo" : b.type === "audio" ? "Endereço do áudio" : "Endereço https para incorporar"} />
            {b.type !== "embed" && <Upload accept={b.type === "video" ? "video/*" : "audio/*"} onDone={(url) => set({ ...b, url })} />}
          </div>
          <input className={inp} value={b.caption ?? ""} onChange={(e) => set({ ...b, caption: e.target.value })} placeholder="Legenda" />
        </div>
      );
  }
}

function Editor() {
  const { id } = Route.useParams();
  const isNew = id === "nova";
  const navigate = useNavigate();
  const [f, setF] = useState<Form>(empty);
  const [loaded, setLoaded] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (isNew) return;
    supabase.from("articles").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) setF({
        ...empty, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ""])),
        is_main_headline: data.is_main_headline, is_featured: data.is_featured,
        published_at: toLocal(data.published_at), body: (data.body as Block[]) ?? [],
      } as Form);
      setLoaded(true);
    });
  }, [id, isNew]);

  const sec = getSection(f.section);

  const save = async (status?: string): Promise<void> => {
    if (!f.title.trim()) { toast.error("Informe a manchete."); return; }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const payload = {
      title: f.title, subtitle: f.subtitle || null, slug: f.slug || slugify(f.title), section: f.section,
      subsection: f.subsection || null, kind: f.kind, author_name: f.author_name || null,
      cover_url: f.cover_url || null, cover_alt: f.cover_alt || null, cover_caption: f.cover_caption || null, cover_credit: f.cover_credit || null,
      video_url: f.video_url || null, audio_url: f.audio_url || null, seo_title: f.seo_title || null, seo_description: f.seo_description || null,
      status: status ?? f.status, published_at: new Date(f.published_at).toISOString(),
      is_main_headline: f.is_main_headline, is_featured: f.is_featured, body: f.body as never,
    };
    if (payload.is_main_headline) await supabase.from("articles").update({ is_main_headline: false }).eq("is_main_headline", true).neq("id", isNew ? "00000000-0000-0000-0000-000000000000" : id);
    const res = isNew
      ? await supabase.from("articles").insert({ ...payload, created_by: u.user?.id ?? null }).select("id").single()
      : await supabase.from("articles").update(payload).eq("id", id).select("id").single();
    setSaving(false);
    if (res.error) { toast.error(res.error.message.includes("slug") ? "Já existe uma notícia com esse endereço." : res.error.message); return; }
    toast.success("Salvo");
    set("status", payload.status);
    if (isNew) navigate({ to: "/admin/$id", params: { id: res.data.id } });
  };

  const del = async () => {
    if (!confirm("Excluir esta notícia?")) return;
    await supabase.from("articles").delete().eq("id", id);
    navigate({ to: "/admin" });
  };

  const moveBlock = (i: number, d: number) => setF((p) => {
    const b = [...p.body]; const j = i + d; if (j < 0 || j >= b.length) return p;
    const t = b[i]!; b[i] = b[j]!; b[j] = t; return { ...p, body: b };
  });

  if (!loaded) return <p className="text-muted-foreground">Carregando…</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
      <div className="grid gap-5">
        <Field label="Manchete"><input className={`${inp} font-serif text-xl`} value={f.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="Subtítulo / linha fina"><textarea className={inp} rows={2} value={f.subtitle} onChange={(e) => set("subtitle", e.target.value)} /></Field>

        <fieldset className="grid gap-3 border p-4">
          <legend className="px-1 text-sm font-bold">Foto de abertura</legend>
          {f.cover_url && <img src={f.cover_url} alt="" className="max-h-56 object-contain" />}
          <div className="flex gap-2"><input className={inp} value={f.cover_url} onChange={(e) => set("cover_url", e.target.value)} placeholder="Endereço da imagem" /><Upload onDone={(u) => set("cover_url", u)} /></div>
          <input className={inp} value={f.cover_caption} onChange={(e) => set("cover_caption", e.target.value)} placeholder="Legenda" />
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inp} value={f.cover_credit} onChange={(e) => set("cover_credit", e.target.value)} placeholder="Crédito" />
            <input className={inp} value={f.cover_alt} onChange={(e) => set("cover_alt", e.target.value)} placeholder="Descrição da imagem" />
          </div>
        </fieldset>

        <div className="grid gap-3">
          <p className="text-sm font-bold">Texto da reportagem</p>
          {f.body.map((b, i) => (
            <div key={i} className="border p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {BLOCK_LABELS[b.type]}
                <div className="flex gap-2">
                  <button onClick={() => moveBlock(i, -1)} aria-label="Subir"><ArrowUp className="h-4 w-4" /></button>
                  <button onClick={() => moveBlock(i, 1)} aria-label="Descer"><ArrowDown className="h-4 w-4" /></button>
                  <button onClick={() => set("body", f.body.filter((_, k) => k !== i))} aria-label="Remover"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <BlockEditor b={b} set={(nb) => set("body", f.body.map((x, k) => (k === i ? nb : x)))} />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(BLOCK_LABELS) as Block["type"][]).map((t) => (
              <button key={t} onClick={() => set("body", [...f.body, newBlock(t)])} className="border px-3 py-1.5 text-xs hover:bg-muted">+ {BLOCK_LABELS[t]}</button>
            ))}
          </div>
        </div>
      </div>

      <aside className="grid content-start gap-4">
        <div className="grid gap-2 border p-4">
          <Button onClick={() => save("published")} disabled={saving}>Publicar</Button>
          <Button variant="outline" onClick={() => save("scheduled")} disabled={saving}>Agendar para a data abaixo</Button>
          <Button variant="ghost" onClick={() => save("draft")} disabled={saving}>Salvar rascunho</Button>
          <p className="text-xs text-muted-foreground">Situação: {f.status === "published" ? "Publicada" : f.status === "scheduled" ? "Agendada" : "Rascunho"}</p>
        </div>
        <Field label="Data e hora de publicação"><input type="datetime-local" className={inp} value={f.published_at} onChange={(e) => set("published_at", e.target.value)} /></Field>
        <Field label="Editoria">
          <select className={inp} value={f.section} onChange={(e) => { set("section", e.target.value); set("subsection", ""); }}>
            {SECTIONS.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </Field>
        {sec && sec.subs.length > 0 && (
          <Field label="Subeditoria">
            <select className={inp} value={f.subsection} onChange={(e) => set("subsection", e.target.value)}>
              <option value="">—</option>
              {sec.subs.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </Field>
        )}
        <Field label="Tipo">
          <select className={inp} value={f.kind} onChange={(e) => set("kind", e.target.value)}>
            <option value="article">Reportagem</option><option value="video">Vídeo</option><option value="audio">Áudio</option>
          </select>
        </Field>
        <Field label="Vídeo principal (opcional)"><input className={inp} value={f.video_url} onChange={(e) => set("video_url", e.target.value)} placeholder="Link YouTube/Vimeo" /></Field>
        <Field label="Áudio principal (opcional)">
          <div className="flex gap-2"><input className={inp} value={f.audio_url} onChange={(e) => set("audio_url", e.target.value)} /><Upload accept="audio/*" label="Enviar" onDone={(u) => set("audio_url", u)} /></div>
        </Field>
        <Field label="Autor"><input className={inp} value={f.author_name} onChange={(e) => set("author_name", e.target.value)} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_main_headline} onChange={(e) => set("is_main_headline", e.target.checked)} /> Manchete principal da capa</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Destaque na capa</label>
        <details className="border p-3 text-sm">
          <summary className="cursor-pointer font-semibold">SEO</summary>
          <div className="mt-3 grid gap-2">
            <input className={inp} value={f.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder="endereco-da-noticia (automático)" />
            <input className={inp} value={f.seo_title} onChange={(e) => set("seo_title", e.target.value)} placeholder="Título SEO" />
            <textarea className={inp} value={f.seo_description} onChange={(e) => set("seo_description", e.target.value)} placeholder="Meta description" />
          </div>
        </details>
        {!isNew && <Button variant="destructive" onClick={del}>Excluir</Button>}
      </aside>
    </div>
  );
}
