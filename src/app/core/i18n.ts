import { Pipe, PipeTransform, signal } from '@angular/core';
import { EN } from './i18n.en';

export type Lang = 'es' | 'en';
const LANG_KEY = 'rutau.lang';

function read(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

/** Idioma activo de la interfaz. Es una señal: todo lo que la lea se actualiza solo al cambiarla. */
export const currentLang = signal<Lang>(read());

export function setLang(l: Lang) {
  currentLang.set(l);
  document.documentElement.lang = l;
  try {
    localStorage.setItem(LANG_KEY, l);
  } catch {
    /* sin almacenamiento: el idioma solo dura la sesión */
  }
}

/** Traduce un texto escrito en español. Si no hay traducción al inglés, devuelve el mismo texto. */
export function tr(es: string): string {
  return currentLang() === 'en' ? (EN[es] ?? es) : es;
}

/** Uso en plantillas: {{ 'Buscar viajes' | t }} */
@Pipe({ name: 't', pure: false })
export class TPipe implements PipeTransform {
  transform(es: string): string {
    return tr(es);
  }
}