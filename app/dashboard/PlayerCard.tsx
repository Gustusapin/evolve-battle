"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Profile } from "@/types/database";
import { getLevelProgress } from "@/lib/utils/leveling";

interface PlayerCardProps {
  profile: Profile;
  isCurrentUser?: boolean;
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
        "glass-card p-5 sm:p-6 flex flex-col gap-4 relative overflow-visible mt-8",
        isCurrentUser && (accent === "player1" ? "shadow-glow-p1" : "shadow-glow-p2")
      )}
    >
      {/* BALÃO FLUTUANTE DA FRASE DO DIA */}
      {profile.quote_of_the_day && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-max max-w-[90%] z-10"
        >
          <div className="bg-zinc-800 border border-white/10 px-4 py-1.5 rounded-2xl shadow-xl text-xs font-medium text-zinc-200 text-center">
            "{profile.quote_of_the_day}"
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-800 border-b border-r border-white/10 rotate-45" />
          </div>
        </motion.div>
      )}

      {isCurrentUser && (
        <span className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          você
        </span>
      )}

      <div className="flex items-center gap-3">
        {/* AVATAR */}
        <div
          className={cn(
            "text-3xl w-14 h-14 rounded-xl flex items-center justify-center bg-zinc-900 border overflow-hidden shrink-0",
            accent === "player1" ? "border-purple-500/30" : "border-emerald-500/30"
          )}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            profile.avatar_emoji
          )}
        </div>
        
        <div>
          <h3 className="font-bold text-lg leading-tight text-white">{profile.username}</h3>
          <p className={cn(
            "text-xs font-mono uppercase tracking-wider",
            accent === "player1" ? "text-purple-400" : "text-emerald-400"
          )}>
            Nível {level}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 mt-2">
        <div className="flex justify-between text-xs font-mono text-zinc-400">
          <span>{pointsIntoLevel.toFixed(1)} XP</span>
          <span>{pointsForNextLevel.toFixed(1)} XP</span>
        </div>
        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              accent === "player1" ? "bg-purple-500" : "bg-emerald-500"
            )}
          />
        </div>
      </div>

      <div className="flex gap-4 mt-2 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-sm">🔥</span>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{profile.current_streak}d</span>
            <span className="text-[10px] text-zinc-500 uppercase">Sequência</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-500 text-sm">🏆</span>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{profile.longest_streak}d</span>
            <span className="text-[10px] text-zinc-500 uppercase">Recorde</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}