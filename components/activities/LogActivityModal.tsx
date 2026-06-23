"use client";

// ============================================================================
// LogActivityModal — formulário para registrar uma nova atividade ou hábito.
// Calcula uma prévia de pontos no cliente (a fonte de verdade é o trigger SQL,
// isso é só feedback visual instantâneo antes de salvar).
// ============================================================================
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
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
  const [error, setError] = useState<string | null>(null);

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
      setError("Informe uma quantidade válida.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("activity_logs").insert({
      user_id: userId,
      activity_type_id: selectedType.id,
      quantity: qty,
    });

    setSubmitting(false);

    if (insertError) {
      setError("Não foi possível salvar. Tente novamente.");
      return;
    }

    setQuantity("");
    onSuccess();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
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
              <div className="glass-card p-6 bg-base-900/95 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-semibold text-lg">Registrar atividade</h2>
                  <button
                    onClick={onClose}
                    className="text-ink-muted hover:text-ink-primary transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Seletor de tipo de atividade */}
                  <div className="grid grid-cols-3 gap-2">
                    {activityTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedTypeId(type.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-soft border transition-all text-xs",
                          selectedTypeId === type.id
                            ? "border-player1 bg-player1/10 text-player1"
                            : "border-white/10 text-ink-secondary hover:border-white/20"
                        )}
                      >
                        <span className="text-xl">{type.icon}</span>
                        <span className="truncate w-full text-center">{type.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Input de quantidade */}
                  <div>
                    <label htmlFor="quantity" className="text-xs text-ink-secondary block mb-1.5">
                      Quantidade {selectedType && `(${selectedType.unit})`}
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      autoFocus
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Ex: 30"
                      className="w-full bg-base-800 border border-white/10 rounded-soft px-4 py-3 text-ink-primary placeholder:text-ink-muted focus:border-player1 outline-none transition-colors font-mono"
                    />
                  </div>

                  {/* Prévia de pontos */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-soft bg-base-800/50">
                    <span className="text-xs text-ink-secondary">Pontos estimados</span>
                    <motion.span
                      key={estimatedPoints}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      className="font-mono font-semibold text-player2"
                    >
                      +{estimatedPoints.toFixed(1)}
                    </motion.span>
                  </div>

                  {error && <p className="text-alert text-xs">{error}</p>}

                  <Button type="submit" fullWidth disabled={submitting}>
                    {submitting ? "Salvando..." : "Confirmar registro"}
                  </Button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
