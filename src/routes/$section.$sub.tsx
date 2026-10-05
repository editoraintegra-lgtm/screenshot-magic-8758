import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { sectionQuery } from "@/lib/articles";
import { getSection, getSub } from "@/lib/sections";
import { SectionPage } from "@/components/site/SectionPage";

export const Route = createFileRoute("/$section/$sub")({
  validateSearch: z.object({ page: z.number().int().min(1).optional() }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ params, context, deps }) => {
    const sub = getSub(params.section, params.sub);
    if (!sub) throw notFound();
    await context.queryClient.ensureQueryData(sectionQuery(params.section, params.sub, deps.page));
    return { name: `${sub.name} · ${getSection(params.section)!.name}` };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Editoria";
    const d = `Notícias de ${name} no Digital Jerusalem.`;
    return { meta: [{ title: `${name} — Digital Jerusalem` }, { name: "description", content: d }, { property: "og:title", content: `${name} — Digital Jerusalem` }, { property: "og:description", content: d }] };
  },
  component: Page,
});

function Page() {
  const { section, sub } = Route.useParams();
  const { page } = Route.useSearch();
  return <SectionPage section={section} sub={sub} page={page ?? 1} />;
}
