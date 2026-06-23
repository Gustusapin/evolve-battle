"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Profile } from "@/types/database";
import { getLevelProgress } from "@/lib/utils/leveling";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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

  // Estados para controlar a edição da frase do dia
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [quoteValue, setQuoteValue] = useState(profile.quote_of_the_day || "");
  const [displayQuote, setDisplayQuote] = useState(profile.quote_of_the_day || "");
  const [isSaving, setIsSaving] = useState(false);

  // Função para salvar no Supabase
  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCurrentUser || isSaving) return;

    setIsSaving(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("profiles")
      .update({ quote_of_the_day: quoteValue })
      .eq("id", profile.id);

    setIsSaving(false);

    if (error) {
      toast.error("Erro ao salvar a frase.");
    } else {
      toast.success("Frase do dia atualizada!");
      setDisplayQuote(quoteValue);
      setIsEditingQuote(false);
    }
  };

  // Regra de exibição: Mostra se for você (para poder editar) OU se o outro jogador tiver uma frase salva.
  const showBalloon = isCurrentUser || displayQuote;

  return (
    <motion.div
      layout
      className={cn(
        "glass-card p-5 sm:p-6 flex flex-col gap-4 relative mt-12",
        isCurrentUser && (accent === "player1" ? "shadow-glow-p1" : "shadow-glow-p2")
      )}
      style={{ overflow: "visible" }}
    >
      {/* BALÃO FLUTUANTE DA FRASE DO DIA */}
      {showBalloon && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-max max-w-[95%] z-50 flex justify-center"
        >
          {isEditingQuote ? (
            // Modo Edição
            <form onSubmit={handleSaveQuote} className="bg-[#18181b] border border-purple-500/50 px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-2 relative">
              <input
                type="text"
                value={quoteValue}
                onChange={(e) => setQuoteValue(e.target.value)}
                placeholder="Qual a frase de hoje?"
                maxLength={50}
                autoFocus
                className="bg-transparent border-none outline-none text-xs text-white min-w-[180px] sm:min-w-[220px]"
              />
              <div className="flex items-center gap-1">
                <button 
                  type="button" 
                  onClick={() => setIsEditingQuote(false)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 px-2 py-1"
                >
                  ✕
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="text-[10px] bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md font-bold transition-colors"
                >
                  {isSaving ? "..." : "Salvar"}
                </button>
              </div>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#18181b] border-b border-r border-purple-500/50 rotate-45" />
            </form>
          ) : (
            // Modo Visualização
            <div 
              onClick={() => isCurrentUser && setIsEditingQuote(true)}
              className={cn(
                "bg-[#18181b] border border-white/10 px-4 py-2 rounded-xl shadow-2xl text-xs font-medium text-zinc-200 text-center relative group",
                isCurrentUser && "cursor-pointer hover:border-white/30 transition-all"
              )}
            >
              "{displayQuote || "Clique para definir uma frase"}"
              {isCurrentUser && (
                <span className="opacity-0 group-hover:opacity-100 absolute -right-2 -top-2 bg-purple-600 text-[10px] p-1 rounded-full shadow-lg transition-opacity">
                  ✏️
                </span>
              )}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#18181b] border-b border-r border-white/10 rotate-45" />
            </div>
          )}
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
            "text-3xl w-14 h-14 rounded-xl flex items-center justify-center bg-zinc-900 border overflow-hidden shrink-0 relative z-10",
            accent === "player1" ? "border-purple-500/30" : "border-emerald-500/30"
          )}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            profile.avatar_emoji
          )}
        </div>
        
        <div className="relative z-10">
          <h3 className="font-bold text-lg leading-tight text-white">{profile.username}</h3>
          <p className={cn(
            "text-xs font-mono uppercase tracking-wider",
            accent === "player1" ? "text-purple-400" : "text-emerald-400"
          )}>
            Nível {level}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 mt-2 relative z-10">
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

      <div className="flex gap-4 mt-2 pt-4 border-t border-white/5 relative z-10">
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