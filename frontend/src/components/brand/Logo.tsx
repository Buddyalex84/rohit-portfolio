import Link from "next/link";

export function Logo({ inverted = false, compact = false }: { inverted?: boolean; compact?: boolean }) {
  const color = inverted ? "#F6F1E8" : "#1B2A4A";
  const gold = "#B08D57";
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Darjee home">
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden>
        <circle cx="18" cy="18" r="17" fill="none" stroke={gold} strokeWidth="1.2" />
        <path
          d="M11 24c2.2-6.5 4-12 7-12s4.8 5.5 7 12"
          fill="none"
          stroke={color}
          strokeWidth="1.4"
        />
        <path d="M13.5 19.5h9" stroke={gold} strokeWidth="1.1" />
        <circle cx="18" cy="11" r="1.4" fill={gold} />
      </svg>
      {!compact && (
        <span
          className="font-serif text-2xl tracking-[0.18em]"
          style={{ color }}
        >
          DARJEE
        </span>
      )}
    </Link>
  );
}
