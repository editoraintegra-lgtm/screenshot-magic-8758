// Espaço reservado para publicidade comercial. Fica claramente separado do conteúdo.
const SIZES = {
  top: "h-24 md:h-28",
  side: "h-[600px]",
  inline: "h-28",
  article: "h-64",
} as const;

export function AdSlot({ position }: { position: keyof typeof SIZES }) {
  return (
    <aside aria-label="Publicidade" className="my-6">
      <p className="mb-1 text-center text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Publicidade</p>
      <div className={`grid w-full place-items-center border border-dashed bg-ad text-xs text-muted-foreground ${SIZES[position]}`}>
        Espaço publicitário disponível
      </div>
    </aside>
  );
}
