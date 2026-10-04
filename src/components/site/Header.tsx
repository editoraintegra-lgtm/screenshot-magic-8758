import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SECTIONS } from "@/lib/sections";
import { Logo } from "./Logo";
import { SocialLinks } from "./Social";

export function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    navigate({ to: "/busca", search: { q: q.trim() } });
  };

  return (
    <header className="bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between border-b py-2 text-xs text-muted-foreground">
          <span className="capitalize">{today}</span>
          <SocialLinks className="hidden sm:flex" />
        </div>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-5 md:py-7">
          <button className="lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <form onSubmit={submit} className="hidden items-center gap-2 border-b border-foreground/30 lg:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" aria-label="Buscar no portal"
              className="w-40 bg-transparent py-1 text-sm outline-none" />
          </form>
          <div className="text-center"><Logo /></div>
          <Link to="/busca" search={{ q: "" }} className="lg:hidden" aria-label="Buscar"><Search className="h-5 w-5" /></Link>
          <div className="hidden lg:block w-48" />
        </div>
      </div>

      <nav className="sticky top-0 z-40 hidden border-y-2 border-rule bg-background lg:block" aria-label="Editorias">
        <ul className="mx-auto flex max-w-7xl items-center justify-center px-4 text-[0.72rem] font-bold uppercase tracking-wider">
          <li><Link to="/" className="block px-3 py-3 hover:text-primary" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>Início</Link></li>
          {SECTIONS.map((s) => (
            <li key={s.slug} className="group relative">
              <Link to="/$section" params={{ section: s.slug }} className="flex items-center gap-1 px-3 py-3 hover:text-primary" activeProps={{ className: "text-primary" }}>
                {s.name}
                {s.subs.length > 0 && <ChevronDown className="h-3 w-3" />}
              </Link>
              {s.subs.length > 0 && (
                <ul className="invisible absolute left-0 top-full min-w-48 border bg-popover py-2 opacity-0 shadow-sm transition group-hover:visible group-hover:opacity-100">
                  {s.subs.map((sub) => (
                    <li key={sub.slug}>
                      <Link to="/$section/$sub" params={{ section: s.slug, sub: sub.slug }} className="block px-4 py-2 font-medium normal-case tracking-normal hover:bg-muted">
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-b-2 border-rule lg:hidden" />

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background lg:hidden">
          <div className="flex items-center justify-between border-b px-4 py-4">
            <Logo size="sm" />
            <button aria-label="Fechar menu" onClick={() => setOpen(false)}><X className="h-6 w-6" /></button>
          </div>
          <form onSubmit={submit} className="flex items-center gap-2 border-b px-4 py-3">
            <Search className="h-4 w-4" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar notícias" className="flex-1 bg-transparent py-1 outline-none" />
          </form>
          <ul className="px-4 py-2">
            <li><Link to="/" onClick={() => setOpen(false)} className="block border-b py-3 font-serif text-xl">Início</Link></li>
            {SECTIONS.map((s) => (
              <li key={s.slug} className="border-b py-3">
                <Link to="/$section" params={{ section: s.slug }} onClick={() => setOpen(false)} className="font-serif text-xl">{s.name}</Link>
                {s.subs.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {s.subs.map((sub) => (
                      <Link key={sub.slug} to="/$section/$sub" params={{ section: s.slug, sub: sub.slug }} onClick={() => setOpen(false)}>{sub.name}</Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <SocialLinks className="px-4 py-6" />
        </div>
      )}
    </header>
  );
}
