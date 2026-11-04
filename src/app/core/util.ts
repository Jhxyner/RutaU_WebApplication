import { currentLang } from './i18n';

/** Iniciales para los avatares: "María López" -> "ML". */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

/** "2026-11-03T07:00:00" -> "lun 3 nov" (sigue el idioma elegido) */
export function fmtDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString(currentLang() === 'en' ? 'en-US' : 'es', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/\./g, '');
}

/** "2026-11-03T07:00:00" -> "07:00" */
export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** ("2026-11-03", "07:00") -> "2026-11-03T07:00:00" */
export function toIsoLocal(date: string, time: string): string {
  return `${date}T${time}:00`;
}

/** Descarga un archivo recibido como Blob (exportar reportes). */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/** Tiempo relativo para listas: "Hace 5 min" / "5 min ago". */
export function relTime(iso: string): string {
  const en = currentLang() === 'en';
  const min = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return en ? 'Just now' : 'Ahora';
  if (min < 60) return en ? `${min} min ago` : `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return en ? `${h} h ago` : `Hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return en ? 'Yesterday' : 'Ayer';
  return en ? `${d} days ago` : `Hace ${d} días`;
}