import { Facebook, Instagram, Youtube, Send } from "lucide-react";

// Substitua "#" pelos endereços oficiais quando disponíveis.
export const SOCIALS = [
  { name: "Instagram", href: "#", Icon: Instagram },
  { name: "Facebook", href: "#", Icon: Facebook },
  { name: "YouTube", href: "#", Icon: Youtube },
  { name: "Telegram", href: "#", Icon: Send },
];

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {SOCIALS.map(({ name, href, Icon }) => (
        <a key={name} href={href} aria-label={name} className="text-muted-foreground transition-colors hover:text-foreground">
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}
