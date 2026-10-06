import { supabase } from "@/integrations/supabase/client";

// Envia um arquivo para o armazenamento e devolve um link de longa duração.
export async function uploadMedia(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw e2 ?? new Error("Falha ao gerar link");
  return data.signedUrl;
}
