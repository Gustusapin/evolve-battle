-- ============================================================================
-- EVOLVE BATTLE — Schema inicial
-- "I have no prime. I will evolve until i die."
-- ============================================================================
-- Este arquivo cria toda a estrutura de banco: perfis, atividades, hábitos,
-- streaks, níveis e as policies de RLS que protegem os dados de cada usuário
-- enquanto permitem que o adversário veja a pontuação (leaderboard).
-- ============================================================================

-- Extensão para gerar UUIDs
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- Espelha auth.users (gerenciado pelo Supabase Auth) com dados públicos do app.
-- Criado automaticamente via trigger quando um usuário se registra.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_emoji text default '🔥',
  total_points numeric(10, 2) not null default 0,
  current_level int not null default 1,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_activity_date date,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Dados públicos de cada competidor. 1 linha por usuário.';

-- ----------------------------------------------------------------------------
-- 2. ACTIVITY_TYPES
-- Catálogo de tipos de exercício e a "fórmula" de pontos de cada um.
-- points_per_unit é multiplicado pela quantidade registrada (min, km, páginas).
-- Mantido em tabela (não hardcoded) para vocês ajustarem o balanceamento depois.
-- ----------------------------------------------------------------------------
create type public.activity_category as enum ('exercicio', 'habito');
create type public.unit_type as enum ('minutos', 'km', 'paginas', 'litros', 'repeticoes');

create table public.activity_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  category public.activity_category not null,
  unit public.unit_type not null,
  points_per_unit numeric(6, 3) not null,
  icon text not null default '💪',
  daily_goal numeric(6, 2), -- usado só para hábitos (ex: meta de 2L de água)
  goal_bonus_points numeric(6, 2) default 0 -- bônus ao bater a meta diária
);

comment on table public.activity_types is 'Catálogo configurável de exercícios e hábitos com a fórmula de pontuação.';

-- Seed inicial — pontos calculados por duração/quantidade, como combinado.
insert into public.activity_types (name, category, unit, points_per_unit, icon, daily_goal, goal_bonus_points) values
  ('Musculação',  'exercicio', 'minutos',     1.0,  '🏋️', null, 0),
  ('Corrida',     'exercicio', 'km',          8.0,  '🏃', null, 0),
  ('Natação',     'exercicio', 'minutos',     1.2,  '🏊', null, 0),
  ('Calistenia',  'exercicio', 'minutos',     1.1,  '🤸', null, 0),
  ('Ciclismo',    'exercicio', 'km',          4.0,  '🚴', null, 0),
  ('Caminhada',   'exercicio', 'km',          3.0,  '🚶', null, 0),
  ('Leitura',     'habito',    'paginas',     0.5,  '📖', 20,   5),
  ('Água',        'habito',    'litros',      2.0,  '💧', 2.5,  5),
  ('Estudo',      'habito',    'minutos',     0.3,  '🧠', 60,   8),
  ('Sono em dia', 'habito',    'minutos',     0.05, '😴', 420,  5);

-- ----------------------------------------------------------------------------
-- 3. ACTIVITY_LOGS
-- Cada registro individual feito por um usuário em um dia.
-- ----------------------------------------------------------------------------
create table public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_type_id uuid not null references public.activity_types(id),
  quantity numeric(8, 2) not null check (quantity > 0),
  points_earned numeric(8, 2) not null default 0,
  hit_daily_goal boolean not null default false,
  logged_for_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index idx_activity_logs_user_date on public.activity_logs (user_id, logged_for_date desc);

comment on table public.activity_logs is 'Histórico de registros diários de atividades/hábitos por usuário.';

-- ----------------------------------------------------------------------------
-- 4. FUNÇÃO: calcular pontos e aplicar bônus de meta diária
-- Roda antes de inserir um log, calcula points_earned automaticamente.
-- ----------------------------------------------------------------------------
create or replace function public.calculate_points()
returns trigger as $$
declare
  v_points_per_unit numeric(6,3);
  v_daily_goal numeric(6,2);
  v_goal_bonus numeric(6,2);
  v_total_today numeric(8,2);
begin
  select points_per_unit, daily_goal, goal_bonus_points
    into v_points_per_unit, v_daily_goal, v_goal_bonus
    from public.activity_types
    where id = new.activity_type_id;

  -- pontos base = quantidade * fator da atividade
  new.points_earned := round(new.quantity * v_points_per_unit, 2);

  -- se essa atividade tem meta diária (hábito), checa se bateu a meta somando
  -- tudo que já foi logado desse tipo nesse dia + o registro atual
  if v_daily_goal is not null then
    select coalesce(sum(quantity), 0) into v_total_today
      from public.activity_logs
      where user_id = new.user_id
        and activity_type_id = new.activity_type_id
        and logged_for_date = new.logged_for_date;

    if (v_total_today + new.quantity) >= v_daily_goal then
      new.hit_daily_goal := true;
      new.points_earned := new.points_earned + v_goal_bonus;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_calculate_points
  before insert on public.activity_logs
  for each row execute function public.calculate_points();

-- ----------------------------------------------------------------------------
-- 5. FUNÇÃO: atualizar perfil (pontos totais, streak e nível) após cada log
-- Streak: incrementa se a última atividade foi ontem; mantém se foi hoje;
-- zera e recomeça em 1 se houve um buraco de mais de 1 dia.
-- Nível: cresce em curva (a cada nível, exige mais pontos que o anterior).
-- ----------------------------------------------------------------------------
create or replace function public.update_profile_after_log()
returns trigger as $$
declare
  v_last_date date;
  v_current_streak int;
  v_longest_streak int;
  v_new_total numeric(10,2);
  v_new_level int;
begin
  select last_activity_date, current_streak, longest_streak
    into v_last_date, v_current_streak, v_longest_streak
    from public.profiles where id = new.user_id;

  if v_last_date is null then
    v_current_streak := 1;
  elsif new.logged_for_date = v_last_date then
    -- já registrou algo hoje, streak não muda
    v_current_streak := v_current_streak;
  elsif new.logged_for_date = v_last_date + 1 then
    v_current_streak := v_current_streak + 1;
  elsif new.logged_for_date > v_last_date + 1 then
    v_current_streak := 1; -- quebrou a sequência
  end if;
  -- nota: registros retroativos (logged_for_date < v_last_date) não afetam streak

  v_longest_streak := greatest(v_longest_streak, v_current_streak);

  update public.profiles
    set total_points = total_points + new.points_earned,
        current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_activity_date = greatest(last_activity_date, new.logged_for_date)
    where id = new.user_id
    returning total_points into v_new_total;

  -- Curva de nível: nível N requer N*(N-1)*50 pontos acumulados (cresce ~quadrático)
  -- Nível 1: 0pts | Nível 2: 100pts | Nível 3: 300pts | Nível 4: 600pts | Nível 5: 1000pts...
  select count(*) into v_new_level
    from generate_series(1, 50) n
    where v_new_total >= (n * (n - 1) * 50);

  update public.profiles set current_level = greatest(v_new_level, 1) where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_profile_after_log
  after insert on public.activity_logs
  for each row execute function public.update_profile_after_log();

-- ----------------------------------------------------------------------------
-- 6. FUNÇÃO: criar profile automaticamente ao registrar novo usuário
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- Regra de negócio: qualquer usuário autenticado pode VER o profile e os logs
-- de qualquer outro (é uma batalha de 2 pessoas — precisam ver o placar um do
-- outro), mas só pode CRIAR/EDITAR/DELETAR os próprios registros.
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.activity_types enable row level security;
alter table public.activity_logs enable row level security;

-- Perfis: leitura pública para autenticados, escrita só do próprio
create policy "profiles_select_all_authenticated"
  on public.profiles for select
  to authenticated using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

-- Tipos de atividade: catálogo é igual para todos, só leitura
create policy "activity_types_select_all"
  on public.activity_types for select
  to authenticated using (true);

-- Logs: todos veem todos os logs (leaderboard/histórico comparativo),
-- mas só inserem/editam/deletam os próprios
create policy "activity_logs_select_all_authenticated"
  on public.activity_logs for select
  to authenticated using (true);

create policy "activity_logs_insert_own"
  on public.activity_logs for insert
  to authenticated with check (auth.uid() = user_id);

create policy "activity_logs_update_own"
  on public.activity_logs for update
  to authenticated using (auth.uid() = user_id);

create policy "activity_logs_delete_own"
  on public.activity_logs for delete
  to authenticated using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 8. REALTIME
-- Habilita replicação para que o leaderboard atualize sozinho nos dois
-- dispositivos quando qualquer um dos dois registrar uma atividade.
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.activity_logs;
