-- Fix/Feature: manuelle Kalorien-/Protein-Ziele + Protein-Tracking im Meal-Log
-- Im Supabase SQL Editor ausführen.

alter table profiles
  add column if not exists manual_calorie_target numeric,
  add column if not exists manual_protein_target numeric;

alter table meal_log
  add column if not exists protein numeric not null default 0;
