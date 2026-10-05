import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SECTIONS } from "@/lib/sections";
import { PAGES } from "@/lib/pages";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const sb = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data } = await sb.from("articles").select("slug,updated_at").order("published_at", { ascending: false }).limit(5000);
        const urls = [
          "/",
          ...SECTIONS.flatMap((s) => [`/${s.slug}`, ...s.subs.map((x) => `/${s.slug}/${x.slug}`)]),
          ...PAGES.map((p) => `/institucional/${p.slug}`),
        ].map((p) => `<url><loc>${origin}${p}</loc></url>`);
        for (const a of data ?? []) urls.push(`<url><loc>${origin}/noticia/${a.slug}</loc><lastmod>${a.updated_at}</lastmod></url>`);
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
        return new Response(xml, { headers: { "content-type": "application/xml" } });
      },
    },
  },
});
