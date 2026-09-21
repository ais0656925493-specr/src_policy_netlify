import type { AppLocale } from './schema'

/**
 * ISO 3166-1 alpha-2 (mã quốc gia từ IP geolocation) → locale giao diện.
 *
 * Chỉ dùng các `AppLocale` đã có file dịch trong `i18n/locales/`.
 * Quốc gia không có trong map hoặc mã không hợp lệ → `'en'` (BCP 47: en-US, xem LOCALE_BCP47).
 *
 * Ghi chú: một quốc gia đa ngữ (ví dụ Bỉ, Canada, Thụy Sĩ) chỉ có thể chọn một locale;
 * ưu tiên ngôn ngữ chính thức / phổ thông trên web khi khớp với bộ dịch hiện có.
 */
const COUNTRY_DEFAULT: Record<string, AppLocale> = {
  // —— Tiếng Ả Rập ——
  SA: 'ar',
  AE: 'ar',
  EG: 'ar',
  IQ: 'ar',
  JO: 'ar',
  KW: 'ar',
  LB: 'ar',
  LY: 'ar',
  MA: 'ar',
  OM: 'ar',
  QA: 'ar',
  BH: 'ar',
  DZ: 'ar',
  TN: 'ar',
  YE: 'ar',
  SY: 'ar',
  SD: 'ar',
  PS: 'ar',
  MR: 'ar',
  SO: 'ar',

  // —— Tiếng Do Thái ——
  IL: 'he',

  // —— Tiếng Việt ——
  VN: 'vi',

  // —— Tiếng Trung giản thể (phổ thông Hoa lục) ——
  CN: 'zh-Hans',

  // —— Tiếng Trung phồn thể / Hồng Kông / Ma Cao ——
  TW: 'zh-Hant',
  HK: 'zh-Hant',
  MO: 'zh-Hant',

  // —— Tiếng Nhật ——
  JP: 'ja',

  // —— Tiếng Hàn ——
  KR: 'ko',
  KP: 'ko',

  // —— Tiếng Thái ——
  TH: 'th',

  // —— Bahasa Indonesia ——
  ID: 'id',

  // —— Tiếng Tây Ban Nha (bản xứ + Mỹ Latin & vùng lãnh thổ dùng es chủ đạo) ——
  ES: 'es',
  MX: 'es',
  GT: 'es',
  SV: 'es',
  HN: 'es',
  NI: 'es',
  CR: 'es',
  PA: 'es',
  CU: 'es',
  DO: 'es',
  PR: 'es',
  AR: 'es',
  BO: 'es',
  CL: 'es',
  CO: 'es',
  EC: 'es',
  PY: 'es',
  PE: 'es',
  VE: 'es',
  UY: 'es',
  GQ: 'es',
  EA: 'es',
  IC: 'es',
  AD: 'es',

  // —— Tiếng Bồ Đào Nha ——
  PT: 'pt',
  BR: 'pt',
  AO: 'pt',
  MZ: 'pt',
  CV: 'pt',
  GW: 'pt',
  ST: 'pt',
  TL: 'pt',

  // —— Tiếng Pháp (châu Âu, hải ngoại Pháp, Caribe & châu Phi Pháp ngữ hành chính) ——
  FR: 'fr',
  MC: 'fr',
  LU: 'fr',
  HT: 'fr',
  SN: 'fr',
  ML: 'fr',
  BF: 'fr',
  NE: 'fr',
  TG: 'fr',
  BJ: 'fr',
  CI: 'fr',
  GN: 'fr',
  GA: 'fr',
  TD: 'fr',
  CF: 'fr',
  CG: 'fr',
  CD: 'fr',
  DJ: 'fr',
  KM: 'fr',
  MG: 'fr',
  BI: 'fr',
  BL: 'fr',
  MF: 'fr',
  GF: 'fr',
  GP: 'fr',
  MQ: 'fr',
  RE: 'fr',
  YT: 'fr',
  PM: 'fr',
  WF: 'fr',
  PF: 'fr',
  NC: 'fr',

  // —— Tiếng Đức (Đức, Áo, Liechtenstein; Thụy Sĩ: tiếng Đức dùng rộng nhất) ——
  DE: 'de',
  AT: 'de',
  LI: 'de',
  CH: 'de',

  // —— Tiếng Séc ——
  CZ: 'cs',

  // —— Tiếng Ý ——
  IT: 'it',
  SM: 'it',
  VA: 'it',

  // —— Tiếng Nga (Nga & vùng CIS; tiếng Nga dùng rộng trong kinh doanh / web) ——
  RU: 'ru',
  BY: 'ru',
  KZ: 'ru',
  KG: 'ru',
  UA: 'uk',
  MD: 'ro',
  AM: 'ru',
  AZ: 'ru',
  TJ: 'ru',
  UZ: 'ru',
  TM: 'ru',
  MN: 'ru',
  LV: 'en',
  EE: 'en',
  LT: 'en',

  // —— Tiếng Thụy Điển ——
  SE: 'sv',
  AX: 'sv',

  // —— Polski ——
  PL: 'pl',

  // —— Nederlands ——
  NL: 'nl',
  BE: 'nl',
  SR: 'nl',
  AW: 'nl',
  CW: 'nl',

  // —— Türkçe ——
  TR: 'tr',

  // —— हिन्दी ——
  IN: 'hi',

  // —— Bahasa Melayu ——
  MY: 'ms',
  BN: 'ms',

  // —— Filipino ——
  PH: 'fil',

  // —— Română ——
  RO: 'ro',

  // —— Magyar ——
  HU: 'hu',

  // —— Ελληνικά ——
  GR: 'el',
  CY: 'el',

  // —— Dansk ——
  DK: 'da',
  GL: 'da',
  FO: 'da',

  // —— Norsk ——
  NO: 'nb',

  // —— Suomi ——
  FI: 'fi',

  // —— Български ——
  BG: 'bg',

  // —— Hrvatski ——
  HR: 'hr',
  BA: 'hr',

  // —— Slovenčina ——
  SK: 'sk',
}

export function countryCodeToAppLocale(countryCode: string | undefined): AppLocale {
  if (!countryCode) return 'en'
  const upper = countryCode.trim().toUpperCase()
  if (upper.length !== 2) return 'en'
  return COUNTRY_DEFAULT[upper] ?? 'en'
}
