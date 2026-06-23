"use client";

import { useState } from "react";
import { ActivityType, UNIT_LABELS } from "@/types/database";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityTypes: ActivityType[];
  onSubmit: (activityTypeId: string, quantity: number) => Promise<void>;
}

export function LogActivityModal({ isOpen, onClose, activityTypes, onSubmit }: LogActivityModalProps) {
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const selectedType = activityTypes.find((t) => t.id === selectedTypeId);
  const estimatedPoints = selectedType ? Number(quantity) * selectedType.points_per_unit : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeId || !quantity) return;

    setIsLoading(true);
    try {
      await onSubmit(selectedTypeId, Number(quantity));
      
      // Notificação de Sucesso com Sonner
      toast.success(`Atividade registrada! +${estimatedPoints.toFixed(1)} XP`, {
        description: "Continue assim para evoluir de nível.",
        icon: "🚀"
      });
      
      setQuantity("");
      setSelectedTypeId("");
      onClose();
    } catch (error) {
      toast.error("Erro ao registrar atividade.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 relative bg-[#0a0a0a]">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          ✕
        </button>
        <h2 className="text-xl font-bold mb-6 text-white">Registrar Atividade</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                <span className="text-[10px] font-medium uppercase tracking-wider">{type.name}</span>
              </button>
            ))}
          </div>

          {selectedType && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <label className="text-sm font-medium text-zinc-400">
                Quantidade ({UNIT_LABELS[selectedType.unit]})
              </label>
              <input
                type="number"
                step={selectedType.unit === "ml" ? "10" : "0.1"}
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={selectedType.unit === "ml" ? "Ex: 250" : "Ex: 30"}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                autoFocus
              />
              <div className="flex justify-between items-center mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-sm text-purple-200">Pontos estimados</span>
                <span className="font-mono font-bold text-purple-400">+{estimatedPoints.toFixed(1)} XP</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedType || !quantity || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            {isLoading ? "Registrando..." : "Confirmar registro"}
          </button>
        </form>
      </div>
    </div>
  );
}