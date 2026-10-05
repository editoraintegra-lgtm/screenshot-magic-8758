import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { sectionQuery } from "@/lib/articles";
import { getSection } from "@/lib/sections";
import { SectionPage } from "@/components/site/SectionPage";

export const Route = createFileRoute("/$section/")({
  validateSearch: z.object({ page: z.number().int().min(1).optional() }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ params, context, deps }) => {
    const s = getSection(params.section);
    if (!s) throw notFound();
    await context.queryClient.ensureQueryData(sectionQuery(params.section, undefined, deps.page));
    return { name: s.name };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Editoria";
    const d = `Notícias de ${name} no Digital Jerusalem.`;
    return { meta: [{ title: `${name} — Digital Jerusalem` }, { name: "description", content: d }, { property: "og:title", content: `${name} — Digital Jerusalem` }, { property: "og:description", content: d }] };
  },
  component: Page,
});

function Page() {
  const { section } = Route.useParams();
  const { page } = Route.useSearch();
  return <SectionPage section={section} page={page ?? 1} />;
}
