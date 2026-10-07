import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";

export function embedUrl(url: string): string | null {
  const yt = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/.exec(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = /vimeo\.com\/(\d+)/.exec(url);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export function VideoPlayer({ url, title = "Vídeo" }: { url: string; title?: string }) {
  const e = embedUrl(url);
  return (
    <div className="aspect-video w-full bg-foreground">
      {e ? (
        <iframe src={e} title={title} className="h-full w-full" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
      ) : (
        <video src={url} controls preload="metadata" className="h-full w-full" />
      )}
    </div>
  );
}

export function Figure({ url, alt, caption, credit, eager, className = "" }: {
  url: string; alt?: string | null | undefined; caption?: string | null | undefined; credit?: string | null | undefined; eager?: boolean | undefined; className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <figure className={className}>
      <button type="button" onClick={() => setOpen(true)} className="group relative block w-full cursor-zoom-in" aria-label="Ampliar imagem">
        <img src={url} alt={alt ?? caption ?? ""} loading={eager ? "eager" : "lazy"} className="w-full object-cover" />
        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center bg-background/85 opacity-0 transition group-hover:opacity-100"><Maximize2 className="h-4 w-4" /></span>
      </button>
      {(caption || credit) && (
        <figcaption className="mt-2 font-sans text-sm text-muted-foreground">
          {caption} {credit && <span className="text-xs uppercase tracking-wider">· {credit}</span>}
        </figcaption>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl border-0 bg-background p-2">
          <DialogTitle className="sr-only">{caption ?? "Imagem ampliada"}</DialogTitle>
          <img src={url} alt={alt ?? caption ?? ""} className="max-h-[85vh] w-full object-contain" />
          {(caption || credit) && <p className="px-2 pb-2 text-sm text-muted-foreground">{caption} {credit && `· ${credit}`}</p>}
        </DialogContent>
      </Dialog>
    </figure>
  );
}
