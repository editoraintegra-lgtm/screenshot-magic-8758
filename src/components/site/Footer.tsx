import { Link } from "@tanstack/react-router";
import { SECTIONS } from "@/lib/sections";
import { PAGES } from "@/lib/pages";
import { SocialLinks } from "./Social";

export function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-rule bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-serif text-3xl font-bold">Digital Jerusalem</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Jornalismo independente sobre Israel, Oriente Médio e o mundo judaico — em português.
            </p>
          </div>
          <SocialLinks />
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t pt-6 text-xs font-bold uppercase tracking-wider">
          {SECTIONS.map((s) => (
            <li key={s.slug}><Link to="/$section" params={{ section: s.slug }} className="hover:text-primary">{s.name}</Link></li>
          ))}
        </ul>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {PAGES.map((p) => (
            <li key={p.slug}><Link to="/institucional/$page" params={{ page: p.slug }} className="hover:text-foreground">{p.title}</Link></li>
          ))}
        </ul>
        <p className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} Digital Jerusalem. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
