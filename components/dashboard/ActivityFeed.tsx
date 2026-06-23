"use client";

// ============================================================================
// ActivityFeed — lista as últimas atividades registradas por qualquer um
// dos dois jogadores, com animação de entrada item a item.
// ============================================================================
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import type { ActivityLog, Profile } from "@/types/database";

interface ActivityFeedProps {
  logs: ActivityLog[];
  profilesById: Record<string, Profile>;
  currentUserId: string;
}

export function ActivityFeed({ logs, profilesById, currentUserId }: ActivityFeedProps) {
  if (logs.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-ink-secondary text-sm">
          Nenhuma atividade registrada ainda. Seja o primeiro a pontuar.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-2 sm:p-3">
      <AnimatePresence initial={false}>
        {logs.map((log) => {
          const profile = profilesById[log.user_id];
          const isMe = log.user_id === currentUserId;
          if (!profile) return null;

          return (
            <motion.div
              key={log.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 px-3 py-3 rounded-soft hover:bg-white/[0.03] transition-colors"
            >
              <div className="text-2xl shrink-0">{log.activity_types?.icon ?? "✅"}</div>

              <div className="flex-1 min-w-0">
                <p className="text-sm leading-tight truncate">
                  <span className={cn("font-semibold", isMe ? "text-player1" : "text-player2")}>
                    {profile.username}
                  </span>{" "}
                  <span className="text-ink-secondary">
                    {log.activity_types?.name.toLowerCase()} · {log.quantity}{" "}
                    {log.activity_types?.unit}
                  </span>
                </p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {formatDistanceToNow(new Date(log.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                  {log.hit_daily_goal && (
                    <span className="text-amber-400 ml-2">★ meta batida</span>
                  )}
                </p>
              </div>

              <span
                className={cn(
                  "text-sm font-mono font-semibold shrink-0",
                  isMe ? "text-player1" : "text-player2"
                )}
              >
                +{log.points_earned.toFixed(0)}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
