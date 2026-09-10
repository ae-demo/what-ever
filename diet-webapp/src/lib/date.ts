/** yyyy-mm-dd for a Date, in local time. */
export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function today(): string {
  return isoDate(new Date());
}

/** Monday of the week containing `d`, as yyyy-mm-dd. */
export function mondayOf(d: Date = new Date()): string {
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return isoDate(monday);
}

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function weekdayLabel(dateIso: string): string {
  const d = new Date(dateIso + "T00:00:00");
  const day = d.getDay();
  return WEEKDAY_LABELS[day === 0 ? 6 : day - 1];
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDayLabel(dateIso: string): string {
  const d = new Date(dateIso + "T00:00:00");
  const today0 = new Date();
  today0.setHours(0, 0, 0, 0);
  const yesterday = new Date(today0);
  yesterday.setDate(today0.getDate() - 1);
  if (isoDate(d) === isoDate(today0)) return "Today";
  if (isoDate(d) === isoDate(yesterday)) return "Yesterday";
  return d.toLocaleDateString();
}
