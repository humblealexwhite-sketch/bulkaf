-- Snack-Log: spontan gegessene Menge eines Lebensmittels aus der Datenbank,
-- ohne dafuer ein ganzes Rezept anzulegen. Kalorien/Protein werden aus
-- foods.kcal/protein x Gramm berechnet, nicht separat gespeichert.
-- Im Supabase SQL Editor NACH schema_v2.sql ausführen.

create table if not exists snack_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  food_id uuid not null references foods(id),
  grams numeric not null,
  created_at timestamptz default now()
);

alter table snack_log enable row level security;

create policy "Users manage own snack log" on snack_log for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
