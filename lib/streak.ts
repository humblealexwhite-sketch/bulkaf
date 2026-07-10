function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// fullyLoggedDates: Tage (yyyy-mm-dd), an denen alle Mahlzeiten-Slots abgehakt wurden.
// Heute zaehlt nur mit, wenn schon komplett; ist es das nicht, bricht die Serie deswegen
// noch nicht, sondern es wird einfach bei gestern weitergezaehlt.
export function computeStreak(fullyLoggedDates: string[]): number {
  const set = new Set(fullyLoggedDates);
  const cursor = new Date();

  if (!set.has(toISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (set.has(toISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function fullyLoggedDatesFromLog(
  rows: { log_date: string; meal_slot: string }[],
  totalSlots: number
): string[] {
  const counts = new Map<string, Set<string>>();
  for (const row of rows) {
    if (!counts.has(row.log_date)) counts.set(row.log_date, new Set());
    counts.get(row.log_date)!.add(row.meal_slot);
  }
  return [...counts.entries()].filter(([, slots]) => slots.size >= totalSlots).map(([date]) => date);
}
