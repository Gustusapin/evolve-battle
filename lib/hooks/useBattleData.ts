"use client";

// ============================================================================
// useBattleData — hook central do dashboard. Busca perfis, tipos de
// atividade e logs recentes, e escuta mudanças em tempo real via Supabase
// Realtime para que o placar atualize sozinho nos dois dispositivos.
// ============================================================================
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityLog, ActivityType, Profile } from "@/types/database";

interface BattleData {
  profiles: Profile[];
  profilesById: Record<string, Profile>;
  activityTypes: ActivityType[];
  recentLogs: ActivityLog[];
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useBattleData(): BattleData {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchAll = useCallback(async () => {
    const [profilesRes, typesRes, logsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("total_points", { ascending: false }),
      supabase.from("activity_types").select("*").order("category"),
      supabase
        .from("activity_logs")
        .select("*, activity_types(*)")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
    if (typesRes.data) setActivityTypes(typesRes.data as ActivityType[]);
    if (logsRes.data) setRecentLogs(logsRes.data as ActivityLog[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAll();

    // Escuta INSERT/UPDATE em profiles e activity_logs — qualquer mudança
    // feita pelo outro jogador atualiza esta tela automaticamente.
    const channel = supabase
      .channel("battle-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll, supabase]);

  const profilesById = profiles.reduce<Record<string, Profile>>((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  return { profiles, profilesById, activityTypes, recentLogs, loading, refetch: fetchAll };
}
