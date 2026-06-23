"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner"; // Importação do Toast
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
    
    if (!selectedType || isNaN(qty) || qty <= 0) {
      toast.error("Informe uma quantidade válida.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("activity_logs").insert({
      user_id: userId,
      activity_type_id: selectedType.id,
      quantity: qty,
    });

    setSubmitting(false);

    if (insertError) {
      toast.error("Não foi possível salvar. Tente novamente.");
      return;
    }

    // Dispara a notificação de sucesso!
    toast.success(`Atividade registrada! +${estimatedPoints.toFixed(1)} XP`, {
      description: "Continue assim para evoluir de nível.",
      icon: "🚀"
    });

    setQuantity("");
    onSuccess();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
          >
            <motion.div
              className="w-full sm:max-w-md my-auto"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ajustado para o estilo escuro (glassmorphism) */}
              <div className="glass-card p-6 relative bg-[#0a0a0a]">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-white">Registrar atividade</h2>
                  <button
                    onClick={onClose}
                    className="text-zinc-500 hover:text-white transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Seletor de tipo de atividade */}
                  <div className="grid grid-cols-3 gap-3">
                    {activityTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedTypeId(type.id)}
                        className={cn(
                          "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all",
                          selectedTypeId === type.id
                            ? "border-purple-500 bg-purple-500/10 text-white"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:bg-white/10"
                        )}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-[10px] font-medium uppercase tracking-wider truncate w-full text-center">
                          {type.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Input de quantidade (Ajustado para o mL dinâmico) */}
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    <label htmlFor="quantity" className="text-sm font-medium text-zinc-400 block mb-2">
                      Quantidade {selectedType && `(${selectedType.unit})`}
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      inputMode="decimal"
                      step={selectedType?.unit === "ml" ? "10" : "0.1"}
                      min="0"
                      autoFocus
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder={selectedType?.unit === "ml" ? "Ex: 250" : "Ex: 30"}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  {/* Prévia de pontos */}
                  <div className="flex items-center justify-between px-4 py-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-sm text-purple-200">Pontos estimados</span>
                    <motion.span
                      key={estimatedPoints}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      className="font-mono font-bold text-purple-400"
                    >
                      +{estimatedPoints.toFixed(1)} XP
                    </motion.span>
                  </div>

                  {/* Botão de Envio */}
                  <button
                    type="submit"
                    disabled={!selectedType || !quantity || submitting}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    {submitting ? "Salvando..." : "Confirmar registro"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}