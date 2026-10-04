import type { Block } from "@/lib/articles";
import { RichText } from "./RichText";
import { Figure, VideoPlayer } from "./Media";
import { AdSlot } from "./AdSlot";

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-news">
      {blocks.map((b, i) => {
        const el = (() => {
          switch (b.type) {
            case "p": return <p><RichText text={b.text} /></p>;
            case "h2": return <h2>{b.text}</h2>;
            case "quote": return (
              <blockquote className="my-8 border-l-4 border-primary pl-5 text-2xl italic leading-snug">
                <RichText text={b.text} />
                {b.cite && <footer className="mt-2 font-sans text-sm not-italic text-muted-foreground">— {b.cite}</footer>}
              </blockquote>
            );
            case "list": return <ul>{b.items.map((it, k) => <li key={k}><RichText text={it} /></li>)}</ul>;
            case "image": return <Figure url={b.url} alt={b.alt} caption={b.caption} credit={b.credit} className="my-8" />;
            case "gallery": return (
              <div className="my-8 grid grid-cols-2 gap-2 md:grid-cols-3">
                {b.images.map((im, k) => <Figure key={k} url={im.url} caption={im.caption} credit={im.credit} className="[&_img]:aspect-square" />)}
              </div>
            );
            case "video": return (
              <figure className="my-8"><VideoPlayer url={b.url} />{b.caption && <figcaption className="mt-2 font-sans text-sm text-muted-foreground">{b.caption}</figcaption>}</figure>
            );
            case "audio": return (
              <figure className="my-8 border p-4"><audio src={b.url} controls preload="none" className="w-full" />{b.caption && <figcaption className="mt-2 font-sans text-sm text-muted-foreground">{b.caption}</figcaption>}</figure>
            );
            case "embed": return /^https:\/\//.test(b.url) ? (
              <figure className="my-8"><iframe src={b.url} title={b.caption ?? "Conteúdo incorporado"} className="h-[450px] w-full border" loading="lazy" />{b.caption && <figcaption className="mt-2 font-sans text-sm text-muted-foreground">{b.caption}</figcaption>}</figure>
            ) : null;
            default: return null;
          }
        })();
        return (
          <div key={i}>
            {el}
            {i === 3 && blocks.length > 6 && <div className="font-sans"><AdSlot position="article" /></div>}
          </div>
        );
      })}
    </div>
  );
}
