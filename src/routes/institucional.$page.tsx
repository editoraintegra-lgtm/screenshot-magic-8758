import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPage } from "@/lib/pages";

export const Route = createFileRoute("/institucional/$page")({
  loader: ({ params }) => {
    const p = getPage(params.page);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => {
    const t = `${loaderData?.title ?? "Institucional"} — Digital Jerusalem`;
    const d = loaderData?.body.slice(0, 150) ?? "";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  component: Page,
});

function Page() {
  const p = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="border-b-2 border-rule pb-4 text-4xl font-bold md:text-5xl">{p.title}</h1>
      <div className="prose-news mt-8">{p.body.split("\n\n").map((t, i) => <p key={i}>{t}</p>)}</div>
    </div>
  );
}
