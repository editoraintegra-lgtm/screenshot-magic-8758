import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function StaffGate({ children }: { children: ReactNode }) {
  const { loading, isStaff, user } = useAuth();
  if (loading) return <p className="p-10 text-center text-muted-foreground">Carregando…</p>;
  if (!isStaff)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">A conta {user?.email} ainda não tem permissão de redação. Peça ao administrador para liberar o acesso.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-6 underline">Sair</button>
      </div>
    );
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between border-b pb-3 text-sm">
        <Link to="/admin" className="font-bold uppercase tracking-wider">Painel da redação</Link>
        <div className="flex items-center gap-4"><span className="text-muted-foreground">{user?.email}</span><button onClick={() => supabase.auth.signOut()} className="underline">Sair</button></div>
      </div>
      {children}
    </div>
  );
}
