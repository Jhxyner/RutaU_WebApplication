import { computed, Service } from '@angular/core';
import { currentLang, Lang, setLang } from '../i18n';

export type { Lang };

@Service()
export class LanguageService {
  readonly lang = currentLang.asReadonly();
  /** Valor para el encabezado Accept-Language que lee el backend (T63). */
  readonly header = computed(() => (this.lang() === 'en' ? 'en-US' : 'es-419'));

  set(l: Lang) {
    setLang(l);
  }
}