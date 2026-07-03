-- Fix: pro User und Tag darf nur noch EIN Gewichts-Eintrag existieren.
-- Neue Einträge für den gleichen Tag überschreiben den alten, statt einen zweiten Punkt zu erzeugen.
-- Im Supabase SQL Editor ausführen.

-- 1. Bestehende Duplikate pro (user_id, log_date) aufräumen — den neuesten (höchste id) behalten
delete from weight_logs a using weight_logs b
where a.user_id = b.user_id
  and a.log_date = b.log_date
  and a.id < b.id;

-- 2. Ab jetzt nur noch ein Eintrag pro User und Tag erlaubt
alter table weight_logs
  add constraint weight_logs_user_date_unique unique (user_id, log_date);
