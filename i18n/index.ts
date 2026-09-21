import type { AppLocale, AppStrings } from './schema'
import { ar } from './locales/ar'
import { cs } from './locales/cs'
import { de } from './locales/de'
import { en } from './locales/en'
import { es } from './locales/es'
import { fr } from './locales/fr'
import { he } from './locales/he'
import { id } from './locales/id'
import { it } from './locales/it'
import { ja } from './locales/ja'
import { ko } from './locales/ko'
import { pt } from './locales/pt'
import { ru } from './locales/ru'
import { sv } from './locales/sv'
import { th } from './locales/th'
import { vi } from './locales/vi'
import { zhHans } from './locales/zh-Hans'
import { zhHant } from './locales/zh-Hant'
import { pl } from './locales/pl'
import { nl } from './locales/nl'
import { tr } from './locales/tr'
import { hi } from './locales/hi'
import { ms } from './locales/ms'
import { fil } from './locales/fil'
import { uk } from './locales/uk'
import { ro } from './locales/ro'
import { hu } from './locales/hu'
import { el } from './locales/el'
import { da } from './locales/da'
import { nb } from './locales/nb'
import { fi } from './locales/fi'
import { bg } from './locales/bg'
import { hr } from './locales/hr'
import { sk } from './locales/sk'

export type { AppLocale, AppStrings } from './schema'
export { APP_LOCALES, LOCALE_BCP47 } from './schema'
export { countryCodeToAppLocale } from './countryToLocale'

const MESSAGES: Record<AppLocale, AppStrings> = {
  en,
  ar,
  vi,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ja,
  ko,
  th,
  id,
  es,
  pt,
  fr,
  de,
  cs,
  he,
  it,
  ru,
  sv,
  pl,
  nl,
  tr,
  hi,
  ms,
  fil,
  uk,
  ro,
  hu,
  el,
  da,
  nb,
  fi,
  bg,
  hr,
  sk,
}

export function getStrings(locale: AppLocale): AppStrings {
  return MESSAGES[locale] ?? MESSAGES.en
}
