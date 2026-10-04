import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim().toLowerCase() });
    setState(error && error.code !== "23505" ? "error" : "ok");
  };

  return (
    <section className="border-y-2 border-rule py-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="kicker">Newsletter</p>
        <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Receba as principais notícias do Digital Jerusalem</h2>
        {state === "ok" ? (
          <p className="mt-6 text-primary">Inscrição registrada. Obrigado!</p>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail"
              aria-label="Seu e-mail" className="flex-1 border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <Button type="submit" size="lg" className="h-auto py-3" disabled={state === "loading"}>Inscrever-se</Button>
          </form>
        )}
        {state === "error" && <p className="mt-2 text-sm text-destructive">Não foi possível concluir. Verifique o e-mail.</p>}
      </div>
    </section>
  );
}
