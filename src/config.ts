export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const ADMIN_EMAILS: string[] = (import.meta.env.VITE_ADMIN_EMAILS || 'harshitcsb@gmail.com')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export function isEmailAdmin(email?: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
