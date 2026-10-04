import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Article = Tables<"articles">;

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[] }
  | { type: "image"; url: string; caption?: string; credit?: string; alt?: string }
  | { type: "gallery"; images: { url: string; caption?: string; credit?: string }[] }
  | { type: "video"; url: string; caption?: string }
  | { type: "audio"; url: string; caption?: string }
  | { type: "embed"; url: string; caption?: string };

const LIST_COLS =
  "id,slug,title,subtitle,section,subsection,kind,author_name,cover_url,cover_alt,published_at,is_main_headline,is_featured,is_demo,audio_url,video_url";
export type ArticleSummary = Pick<
  Article,
  | "id" | "slug" | "title" | "subtitle" | "section" | "subsection" | "kind" | "author_name"
  | "cover_url" | "cover_alt" | "published_at" | "is_main_headline" | "is_featured" | "is_demo"
  | "audio_url" | "video_url"
>;

export const PAGE_SIZE = 12;

export const homeQuery = () =>
  queryOptions({
    queryKey: ["home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(LIST_COLS)
        .order("published_at", { ascending: false })
        .limit(120);
      if (error) throw error;
      return (data ?? []) as ArticleSummary[];
    },
  });

export const sectionQuery = (section: string, sub: string | undefined, page: number) =>
  queryOptions({
    queryKey: ["section", section, sub ?? "", page],
    queryFn: async () => {
      let q = supabase
        .from("articles")
        .select(LIST_COLS, { count: "exact" })
        .eq("section", section)
        .order("published_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (sub) q = q.eq("subsection", sub);
      const { data, error, count } = await q;
      if (error) throw error;
      return { items: (data ?? []) as ArticleSummary[], total: count ?? 0 };
    },
  });

export const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const { data: related } = await supabase
        .from("articles")
        .select(LIST_COLS)
        .eq("section", data.section)
        .neq("id", data.id)
        .order("published_at", { ascending: false })
        .limit(7);
      return { article: data as Article, related: (related ?? []) as ArticleSummary[] };
    },
  });

export const searchQuery = (term: string, order: "relevance" | "date") =>
  queryOptions({
    queryKey: ["search", term, order],
    queryFn: async () => {
      const t = term.trim().replace(/[%,()]/g, " ");
      if (!t) return [] as ArticleSummary[];
      const like = `%${t}%`;
      const { data, error } = await supabase
        .from("articles")
        .select(LIST_COLS)
        .ilike("search_text", like)
        .order("published_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      const rows = (data ?? []) as ArticleSummary[];
      if (order === "date") return rows;
      const low = t.toLowerCase();
      const score = (a: ArticleSummary) =>
        (a.title.toLowerCase().includes(low) ? 5 : 0) +
        ((a.subtitle ?? "").toLowerCase().includes(low) ? 2 : 0) +
        ((a.author_name ?? "").toLowerCase().includes(low) ? 2 : 0) + 1;
      return [...rows].sort((a, b) => score(b) - score(a));
    },
  });

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
}
export function formatDateTime(iso: string) {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}
