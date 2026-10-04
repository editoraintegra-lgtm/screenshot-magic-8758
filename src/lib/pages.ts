// Textos institucionais provisórios — devem ser substituídos pelo conteúdo oficial.
export const PAGES = [
  { slug: "sobre", title: "Sobre", body: "O Digital Jerusalem é um portal jornalístico independente dedicado a Israel, ao Oriente Médio e ao mundo judaico, com cobertura também de tecnologia, ciência, arqueologia e acontecimentos internacionais relevantes.\n\nTexto provisório: o conteúdo oficial desta página será publicado pela direção do portal." },
  { slug: "politica-editorial", title: "Política Editorial", body: "Texto provisório. A política editorial oficial do Digital Jerusalem será publicada nesta página." },
  { slug: "privacidade", title: "Política de Privacidade", body: "Texto provisório. A política de privacidade oficial será publicada nesta página." },
  { slug: "termos", title: "Termos de Uso", body: "Texto provisório. Os termos de uso oficiais serão publicados nesta página." },
  { slug: "contato", title: "Contato", body: "Texto provisório. Os canais oficiais de contato da redação serão publicados nesta página." },
];
export const getPage = (slug: string) => PAGES.find((p) => p.slug === slug);
