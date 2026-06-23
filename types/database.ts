// ============================================================================
// Tipos do domínio — espelham as tabelas do Supabase definidas em
// supabase/migrations/001_init_schema.sql
// ============================================================================

export type ActivityCategory = "exercicio" | "habito";
// Removido "litros" e adicionado "ml"
export type UnitType = "minutos" | "km" | "paginas" | "ml" | "repeticoes"; 

export interface Profile {
  id: string;
  username: string;
  avatar_emoji: string;
  avatar_url?: string | null;       // <-- NOVA COLUNA (Avatar)
  quote_of_the_day?: string | null; // <-- NOVA COLUNA (Frase do dia)
  total_points: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
}

export interface ActivityType {
  id: string;
  name: string;
  category: ActivityCategory;
  unit: UnitType;
  points_per_unit: number;
  icon: string;
  daily_goal: number | null;
  goal_bonus_points: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type_id: string;
  quantity: number;
  points_earned: number;
  hit_daily_goal: boolean;
  logged_for_date: string;
  note: string | null;
  created_at: string;
  // join opcional, populado quando buscamos com .select('*, activity_types(*)')
  activity_types?: ActivityType;
}

// Payload usado ao criar um novo registro de atividade
export interface NewActivityLogInput {
  activity_type_id: string;
  quantity: number;
  logged_for_date?: string; // default: hoje
  note?: string;
}

// Unidade de exibição amigável para cada unit_type
export const UNIT_LABELS: Record<UnitType, string> = {
  minutos: "min",
  km: "km",
  paginas: "pág.",
  ml: "mL", // <-- ATUALIZADO AQUI TAMBÉM
  repeticoes: "reps",
};