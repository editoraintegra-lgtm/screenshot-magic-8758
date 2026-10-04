export type Sub = { slug: string; name: string };
export type Section = { slug: string; name: string; subs: Sub[] };

export const SECTIONS: Section[] = [
  { slug: "israel", name: "Israel", subs: [
    { slug: "politica", name: "Política" },
    { slug: "sociedade", name: "Sociedade" },
    { slug: "economia", name: "Economia" },
  ] },
  { slug: "oriente-medio", name: "Oriente Médio", subs: [
    { slug: "seguranca", name: "Segurança" },
    { slug: "diplomacia", name: "Diplomacia" },
  ] },
  { slug: "mundo-judaico", name: "Mundo Judaico", subs: [
    { slug: "brasil", name: "Brasil" },
    { slug: "america-do-sul", name: "América do Sul" },
    { slug: "america-do-norte", name: "América do Norte" },
    { slug: "europa", name: "Europa" },
    { slug: "oceania-e-africa", name: "Oceania e África" },
  ] },
  { slug: "tecnologia", name: "Tecnologia", subs: [] },
  { slug: "ciencia", name: "Ciência", subs: [] },
  { slug: "arqueologia", name: "Arqueologia", subs: [] },
  { slug: "especial", name: "Especial", subs: [] },
  { slug: "videos", name: "Vídeos", subs: [] },
  { slug: "radio", name: "Rádio Digital Jerusalem", subs: [
    { slug: "podcasts", name: "Podcasts" },
    { slug: "boletins", name: "Boletins" },
    { slug: "entrevistas", name: "Entrevistas" },
    { slug: "programas", name: "Programas" },
  ] },
];

export const getSection = (slug?: string | null) => SECTIONS.find((s) => s.slug === slug);
export const getSub = (section?: string | null, sub?: string | null) =>
  getSection(section)?.subs.find((s) => s.slug === sub);
export const sectionName = (slug?: string | null) => getSection(slug)?.name ?? slug ?? "";
export const labelFor = (section?: string | null, sub?: string | null) =>
  getSub(section, sub)?.name ?? sectionName(section);
