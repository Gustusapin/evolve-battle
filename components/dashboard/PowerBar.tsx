"use client";

// ============================================================================
// PowerBar — o elemento de assinatura do design.
// Uma barra horizontal dividida proporcionalmente entre os dois competidores,
// como uma barra de vida de jogo de luta. Redesenha-se com animação suave
// toda vez que a pontuação muda (via Framer Motion + layout animation).
// ============================================================================
import { motion } from "framer-motion";
import type { Profile } from "@/types/database";

interface PowerBarProps {
  player1: Profile;
  player2: Profile;
}

export function PowerBar({ player1, player2 }: PowerBarProps) {
  const total = player1.total_points + player2.total_points;
  // evita divisão por zero no início da competição (ninguém pontuou ainda)
  const p1Percent = total === 0 ? 50 : (player1.total_points / total) * 100;
  const p2Percent = 100 - p1Percent;

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-3 font-display">
        <PlayerLabel name={player1.username} points={player1.total_points} color="player1" align="left" />
        <PlayerLabel name={player2.username} points={player2.total_points} color="player2" align="right" />
      </div>

      <div className="relative h-5 sm:h-6 w-full rounded-full overflow-hidden bg-base-800 border border-white/[0.06]">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-player1-dim to-player1 shadow-glow-p1"
          initial={{ width: "50%" }}
          animate={{ width: `${p1Percent}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
        />
        <motion.div
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-player2-dim to-player2 shadow-glow-p2"
          initial={{ width: "50%" }}
          animate={{ width: `${p2Percent}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
        />
        {/* linha central de divisão, sutil */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
      </div>

      <p className="text-center text-xs text-ink-muted mt-2 font-mono">
        {total === 0
          ? "A batalha ainda não começou"
          : p1Percent > p2Percent
            ? `${player1.username} está na frente por ${(p1Percent - 50).toFixed(0)}%`
            : p2Percent > p1Percent
              ? `${player2.username} está na frente por ${(p2Percent - 50).toFixed(0)}%`
              : "Empate técnico"}
      </p>
    </div>
  );
}

function PlayerLabel({
  name,
  points,
  color,
  align,
}: {
  name: string;
  points: number;
  color: "player1" | "player2";
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className="text-xs uppercase tracking-wide text-ink-secondary">{name}</p>
      <motion.p
        key={points} // dispara animação de "pop" sempre que o valor muda
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 0.4 }}
        className={`text-2xl sm:text-3xl font-bold tabular-nums ${
          color === "player1" ? "text-player1" : "text-player2"
        }`}
      >
        {points.toFixed(0)}
        <span className="text-xs text-ink-muted ml-1 font-mono font-normal">pts</span>
      </motion.p>
    </div>
  );
}
