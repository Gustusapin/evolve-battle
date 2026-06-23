"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { getLevelProgress } from "@/lib/utils/leveling";
import type { ActivityType } from "@/types/database";

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTypes: ActivityType[];
  userId: string;
  onSuccess: () => void;
}

export function LogActivityModal({
  isOpen,
  onClose,
  activityTypes,
  userId,
  onSuccess,
}: LogActivityModalProps) {
  const [selectedTypeId, setSelectedTypeId] = useState<string>(activityTypes[0]?.id ?? "");
  const [quantity, setQuantity] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const selectedType = activityTypes.find((t) => t.id === selectedTypeId);

  const estimatedPoints = useMemo(() => {
    const qty = parseFloat(quantity);
    if (!selectedType || isNaN(qty) || qty <= 0) return 0;
    return qty * selectedType.points_per_unit;
  }, [quantity, selectedType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(quantity);
    
    if (!selectedType || isNaN(qty) || qty <= 0) return;

    setSubmitting(true);
    const supabase = createClient();

    // 1. Pega o XP atual ANTES de salvar
    const { data: profileBefore } = await supabase.from("profiles").select("total_points").eq("id", userId).single();
    const oldLevel = getLevelProgress(profileBefore?.total_points || 0).level;

    // 2. Salva a atividade
    const { error: insertError } = await supabase.from("activity_logs").insert({
      user_id: userId,
      activity_type_id: selectedType.id,
      quantity: qty,
    });

    if (insertError) {
      toast.error("Erro ao salvar atividade.");
      setSubmitting(false);
      return;
    }

    // 3. Pega o XP novo DEPOIS de salvar
    const { data: profileAfter } = await supabase.from("profiles").select("total_points").eq("id", userId).single();
    const newLevel = getLevelProgress(profileAfter?.total_points || 0).level;

    // 4. Lógica do Pop-up (Toast)
    if (newLevel > oldLevel) {
      toast.success(`LEVEL UP! 🎉`, {
        description: `Parabéns! Você alcançou o nível ${newLevel}.`,
        duration: 6000,
      });
    } else {
      toast.success(`+${estimatedPoints.toFixed(1)} XP adicionados!`);
    }

    setQuantity("");
    onSuccess();
    onClose();
    setSubmitting(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-card w-full max-w-md p-6 relative bg-[#0a0a0a]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white">Registrar atividade</h2>
                <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-3">
                  {activityTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedTypeId(type.id)}
                      className={cn("p-3 rounded-xl border flex flex-col items-center gap-2", selectedTypeId === type.id ? "border-purple-500 bg-purple-500/10" : "border-white/10")}
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <span className="text-[10px] uppercase truncate w-full text-center">{type.name}</span>
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Quantidade..."
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                />

                <button type="submit" disabled={submitting} className="w-full bg-purple-600 py-3 rounded-xl font-bold text-white">
                  {submitting ? "Salvando..." : "Confirmar"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}