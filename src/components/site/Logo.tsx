import { Link } from "@tanstack/react-router";

export function Logo({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <Link to="/" className="inline-flex flex-col items-center leading-none" aria-label="Digital Jerusalem — início">
      <span className={size === "lg" ? "font-serif text-3xl font-bold tracking-tight md:text-5xl" : "font-serif text-xl font-bold"}>
        Digital Jerusalem
      </span>
    </Link>
  );
}
