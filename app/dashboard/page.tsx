"use client";

// ============================================================================
// Dashboard / Página da Batalha
// A tela principal: manifesto em destaque, PowerBar (elemento de assinatura),
// cards de cada jogador lado a lado, e o feed de atividades recentes.
// ============================================================================
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, LogOut } from "lucide-react";
import { PowerBar } from "@/components/dashboard/PowerBar";
import { PlayerCard } from "@/components/dashboard/PlayerCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { LogActivityModal } from "@/components/activities/LogActivityModal";
import { Button } from "@/components/ui/Button";
import { useBattleData } from "@/lib/hooks/useBattleData";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { profiles, profilesById, activityTypes, recentLogs, loading, refetch } = useBattleData();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  // Recupera o id do usuário logado uma vez (necessário para destacar "você" e enviar logs)
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-muted font-mono text-sm animate-pulse-glow">Carregando batalha...</p>
      </div>
    );
  }

  const [player1, player2] = profiles;

  return (
    <main className="min-h-screen pb-28">
      {/* Header simples */}
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex justify-between items-center">
        <span className="font-display font-semibold text-sm tracking-wide text-ink-secondary">
          EVOLVE BATTLE
        </span>
        <button
          onClick={handleSignOut}
          className="text-ink-muted hover:text-alert transition-colors flex items-center gap-1.5 text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>
      </header>

      {/* Frase de destaque — elemento obrigatório do brief */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-8 text-center"
      >
        <h1 className="manifesto text-3xl sm:text-5xl">
          I have no prime.
          <br />
          I will evolve until i die.
        </h1>
      </motion.section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col gap-6">
        {/* PowerBar — placar comparativo animado */}
        {player1 && player2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-5 sm:p-6"
          >
            <PowerBar player1={player1} player2={player2} />
          </motion.div>
        )}

        {/* Cards dos dois jogadores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {player1 && (
            <PlayerCard
              profile={player1}
              isCurrentUser={player1.id === currentUserId}
              variant="player1"
            />
          )}
          {player2 && (
            <PlayerCard
              profile={player2}
              isCurrentUser={player2.id === currentUserId}
              variant="player2"
            />
          )}
        </div>

        {/* Feed de atividades */}
        <div>
          <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-ink-secondary mb-3">
            Atividade recente
          </h2>
          <ActivityFeed
            logs={recentLogs}
            profilesById={profilesById}
            currentUserId={currentUserId ?? ""}
          />
        </div>
      </div>

      {/* Botão flutuante de registrar atividade */}
      <motion.div
        className="fixed bottom-6 inset-x-0 flex justify-center z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-6 shadow-glow-p1"
        >
          <Plus className="w-4 h-4" />
          Registrar atividade
        </Button>
      </motion.div>

      {currentUserId && (
        <LogActivityModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          activityTypes={activityTypes}
          userId={currentUserId}
          onSuccess={refetch}
        />
      )}
    </main>
  );
}
