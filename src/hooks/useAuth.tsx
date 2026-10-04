import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async (s: Session | null) => {
      setSession(s);
      if (!s) { setIsStaff(false); setLoading(false); return; }
      const { data } = await supabase.rpc("is_staff", { _user_id: s.user.id });
      setIsStaff(!!data);
      setLoading(false);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setTimeout(() => check(s), 0); });
    supabase.auth.getSession().then(({ data }) => check(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, isStaff, loading };
}
