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
  const { level, pointsIntoLevel, pointsForNextLevel, progressPercent } = getLevelProgress(profile.total_points);
  const accent = variant === "player1" ? "player1" : "player2";

  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [quoteValue, setQuoteValue] = useState(profile.quote_of_the_day || "");
  const [displayQuote, setDisplayQuote] = useState(profile.quote_of_the_day || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCurrentUser) return;
    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ quote_of_the_day: quoteValue }).eq("id", profile.id);
    setIsSaving(false);
    if (error) toast.error("Erro ao salvar.");
    else { toast.success("Frase atualizada!"); setDisplayQuote(quoteValue); setIsEditingQuote(false); }
  };

  const handleUpdateAvatar = async () => {
    const newUrl = prompt("Cole o link da sua imagem de avatar:", profile.avatar_url || "");
    if (newUrl) {
      const supabase = createClient();
      await supabase.from("profiles").update({ avatar_url: newUrl }).eq("id", profile.id);
      window.location.reload(); // Recarrega para aplicar a imagem
    }
  };

  return (
    <motion.div layout className={cn("glass-card p-6 relative mt-12", isCurrentUser && (accent === "player1" ? "shadow-glow-p1" : "shadow-glow-p2"))} style={{ overflow: "visible" }}>
      {/* Balão de Frase */}
      <motion.div className="absolute -top-12 left-1/2 -translate-x-1/2 w-max max-w-[90%] z-50">
        {isEditingQuote ? (
          <form onSubmit={handleSaveQuote} className="bg-[#18181b] border border-purple-500/50 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <input value={quoteValue} onChange={(e) => setQuoteValue(e.target.value)} className="bg-transparent outline-none text-xs text-white" maxLength={50} autoFocus />
            <button type="submit" className="text-[10px] bg-purple-600 px-2 py-1 rounded">Salvar</button>
          </form>
        ) : (
          <div onClick={() => isCurrentUser && setIsEditingQuote(true)} className="bg-[#18181b] border border-white/10 px-4 py-2 rounded-xl text-xs text-zinc-200 cursor-pointer hover:border-purple-500/50">
            "{displayQuote || "Definir frase..."}"
          </div>
        )}
      </motion.div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="w-14 h-14 rounded-xl border border-white/10 overflow-hidden bg-zinc-900">
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-2xl">{profile.avatar_emoji}</span>}
          </div>
          {isCurrentUser && <button onClick={handleUpdateAvatar} className="absolute -bottom-1 -right-1 bg-purple-600 text-[10px] p-1 rounded-full">✏️</button>}
        </div>
        <div>
          <h3 className="font-bold text-white">{profile.username}</h3>
          <p className="text-xs text-purple-400">Nível {level}</p>
        </div>
      </div>
      
      {/* Barra de Progresso */}
      <div className="mt-4 h-2 bg-zinc-900 rounded-full overflow-hidden">
        <motion.div className={cn("h-full", accent === "player1" ? "bg-purple-500" : "bg-emerald-500")} initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} />
      </div>
    </motion.div>
  );
}