const pad = (n: number) => String(n).padStart(2, '0');

/** Local-calendar day key like "2026-11-03", so late-night logs land on the day the user lived. */
export function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
