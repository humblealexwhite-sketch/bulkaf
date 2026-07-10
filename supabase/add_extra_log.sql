-- Ad-hoc Extra-Kalorien: spontane Snacks/Getränke ohne festen Mahlzeiten-Slot.
-- Im Supabase SQL Editor NACH schema_v2.sql ausführen.

create table if not exists extra_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  label text,
  kcal numeric not null,
  protein numeric not null default 0,
  created_at timestamptz default now()
);

alter table extra_log enable row level security;

create policy "Users manage own extra log" on extra_log for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
