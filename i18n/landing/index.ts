import type { AppLocale } from '../schema'
import { arLanding } from './ar'
import { csLanding } from './cs'
import { deLanding } from './de'
import { enLanding } from './en'
import { esLanding } from './es'
import { frLanding } from './fr'
import { heLanding } from './he'
import { idLanding } from './id'
import { itLanding } from './it'
import { jaLanding } from './ja'
import { koLanding } from './ko'
import { ptLanding } from './pt'
import { ruLanding } from './ru'
import { svLanding } from './sv'
import { thLanding } from './th'
import type { LandingStrings } from './types'
import { viLanding } from './vi'
import { zhHansLanding } from './zh-Hans'
import { zhHantLanding } from './zh-Hant'
import { plLanding } from './pl'
import { nlLanding } from './nl'
import { trLanding } from './tr'
import { hiLanding } from './hi'
import { msLanding } from './ms'
import { filLanding } from './fil'
import { ukLanding } from './uk'
import { roLanding } from './ro'
import { huLanding } from './hu'
import { elLanding } from './el'
import { daLanding } from './da'
import { nbLanding } from './nb'
import { fiLanding } from './fi'
import { bgLanding } from './bg'
import { hrLanding } from './hr'
import { skLanding } from './sk'

const MESSAGES: Record<AppLocale, LandingStrings> = {
  en: enLanding,
  ar: arLanding,
  vi: viLanding,
  'zh-Hans': zhHansLanding,
  'zh-Hant': zhHantLanding,
  ja: jaLanding,
  ko: koLanding,
  th: thLanding,
  id: idLanding,
  es: esLanding,
  pt: ptLanding,
  fr: frLanding,
  de: deLanding,
  cs: csLanding,
  he: heLanding,
  it: itLanding,
  ru: ruLanding,
  sv: svLanding,
  pl: plLanding,
  nl: nlLanding,
  tr: trLanding,
  hi: hiLanding,
  ms: msLanding,
  fil: filLanding,
  uk: ukLanding,
  ro: roLanding,
  hu: huLanding,
  el: elLanding,
  da: daLanding,
  nb: nbLanding,
  fi: fiLanding,
  bg: bgLanding,
  hr: hrLanding,
  sk: skLanding,
}

export type { LandingStrings } from './types'

export function getLandingStrings(locale: AppLocale): LandingStrings {
  return MESSAGES[locale] ?? enLanding
}
