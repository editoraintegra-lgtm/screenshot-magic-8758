import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso da redação — Digital Jerusalem" },
      { name: "description", content: "Área de acesso restrito para a equipe editorial." },
      { property: "og:title", content: "Acesso da redação — Digital Jerusalem" },
      { property: "og:description", content: "Área de acesso restrito para a equipe editorial." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/admin" }); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { if (s) navigate({ to: "/admin" }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    if (mode === "up" && !res.data.session) toast.success("Verifique seu e-mail para confirmar o cadastro.");
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Não foi possível entrar com Google.");
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl font-bold">Acesso da redação</h1>
      <p className="mt-2 text-sm text-muted-foreground">A primeira conta criada recebe acesso de administrador.</p>
      <form onSubmit={submit} className="mt-8 grid gap-3">
        <input type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-input bg-background px-3 py-2" />
        <input type="password" required minLength={6} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="border border-input bg-background px-3 py-2" />
        <Button type="submit" disabled={busy}>{mode === "in" ? "Entrar" : "Criar conta"}</Button>
      </form>
      <Button variant="outline" className="mt-3 w-full" onClick={google}>Continuar com Google</Button>
      <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-6 text-sm text-muted-foreground underline">
        {mode === "in" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
      </button>
    </div>
  );
}
