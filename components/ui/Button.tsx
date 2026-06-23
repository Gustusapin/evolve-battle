"use client";

// ============================================================================
// Button — botão base do design system. Bordas arredondadas (soft), feedback
// tátil no clique (scale down) via Framer Motion, e variantes de cor.
// ============================================================================
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-player1-dim to-player1 text-white shadow-glow-p1 hover:brightness-110",
  secondary:
    "bg-base-800 text-ink-primary border border-white/10 hover:bg-base-700",
  ghost: "bg-transparent text-ink-secondary hover:bg-white/5",
  danger: "bg-alert/15 text-alert border border-alert/30 hover:bg-alert/25",
};

export function Button({
  variant = "primary",
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "px-5 py-3 rounded-soft font-medium text-sm transition-colors duration-200",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        fullWidth && "w-full",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
