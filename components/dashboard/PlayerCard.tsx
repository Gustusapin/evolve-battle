"use client";

// ============================================================================
// PlayerCard — card glassmorphism com nível, streak e progresso de XP de
// um jogador. Usado duas vezes no dashboard (lado a lado).
// ============================================================================
import { motion } from "framer-motion";
import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getLevelProgress, getLevelTitle } from "@/lib/utils/leveling";
import type { Profile } from "@/types/database";

interface PlayerCardProps {
  profile: Profile;
  isCurrentUser: boolean;
  variant: "player1" | "player2";
}

export function PlayerCard({ profile, isCurrentUser, variant }: PlayerCardProps) {
  const { level, pointsIntoLevel, pointsForNextLevel, progressPercent } = getLevelProgress(
    profile.total_points
  );

  const accent = variant === "player1" ? "player1" : "player2";

  return (
    <motion.div
      layout
      className={cn(
        "glass-card p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden",
        isCurrentUser && (accent === "player1" ? "shadow-glow-p1" : "shadow-glow-p2")
      )}
    >
      {isCurrentUser && (
        <span className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-wider text-ink-muted">
          você
        </span>
      )}

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "text-3xl w-12 h-12 rounded-soft flex items-center justify-center bg-base-800 border",
            accent === "player1" ? "border-player1/30" : "border-player2/30"
          )}
        >
          {profile.avatar_emoji}
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg leading-tight">{profile.username}</h3>
          <p
            className={cn(
              "text-xs font-mono uppercase tracking-wide",
              accent === "player1" ? "text-player1" : "text-player2"
            )}
          >
            {getLevelTitle(level)} · Nível {level}
          </p>
        </div>
      </div>

      {/* Barra de progresso de XP até o próximo nível */}
      <div>
        <div className="flex justify-between text-xs text-ink-muted mb-1.5 font-mono">
          <span>{pointsIntoLevel.toFixed(0)} XP</span>
          <span>{pointsForNextLevel.toFixed(0)} XP</span>
        </div>
        <div className="h-2 w-full bg-base-800 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              accent === "player1" ? "bg-player1" : "bg-player2"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Streak e maior streak */}
      <div className="flex gap-4 pt-1">
        <Stat
          icon={<Flame className="w-4 h-4 text-alert" />}
          label="Sequência"
          value={`${profile.current_streak}d`}
        />
        <Stat
          icon={<Trophy className="w-4 h-4 text-amber-400" />}
          label="Recorde"
          value={`${profile.longest_streak}d`}
        />
      </div>
    </motion.div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-sm font-semibold leading-none">{value}</p>
        <p className="text-[10px] text-ink-muted leading-none mt-0.5">{label}</p>
      </div>
    </div>
  );
}
