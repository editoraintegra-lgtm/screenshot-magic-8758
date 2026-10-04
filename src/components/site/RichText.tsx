import { Fragment, type ReactNode } from "react";

// Mini formatação: **negrito**, *itálico*, [texto](url)
export function RichText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(<strong key={i++}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("*")) out.push(<em key={i++}>{tok.slice(1, -1)}</em>);
    else {
      const [, label, href] = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!;
      const safe = /^(https?:\/\/|\/)/.test(href) ? href : "#";
      const ext = safe.startsWith("http");
      out.push(<a key={i++} href={safe} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</a>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out.map((n, k) => <Fragment key={k}>{n}</Fragment>)}</>;
}
