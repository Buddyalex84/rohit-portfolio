import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  gold: "bg-gold text-ivory hover:bg-gold-soft",
  navy: "bg-navy text-ivory hover:bg-navy-deep",
  ghost: "border border-charcoal/20 bg-transparent text-charcoal hover:border-gold hover:text-navy",
  light: "bg-ivory text-navy hover:bg-white",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: keyof typeof variants;
  children: ReactNode;
};

export function Button({ href, variant = "gold", className = "", children, ...props }: Props) {
  const classes = `inline-flex items-center justify-center rounded-sm px-6 py-3 text-sm tracking-[0.14em] uppercase transition ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
