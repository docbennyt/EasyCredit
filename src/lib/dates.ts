import { format, isToday, isPast, isFuture, parseISO } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

export function isDateToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isToday(d);
}

export function isDatePast(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isPast(d) && !isToday(d);
}

export function isDateFuture(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isFuture(d);
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
