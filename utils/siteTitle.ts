import type { AppLocale } from '@/i18n/schema'

const DEFAULT_TITLE = 'Community Standards | Transparency Center'
const DEFAULT_DESCRIPTION =
  'Community Standards outline what is and isn\'t allowed on Facebook, Instagram, Messenger and Threads. If your Page was flagged, you may submit an appeal for review.'

const TITLE_BY_LOCALE: Partial<Record<AppLocale, string>> = {
  en: DEFAULT_TITLE,
  vi: 'Tiêu chuẩn Cộng đồng | Transparency Center',
  ar: 'Community Standards | Transparency Center',
  de: 'Community Standards | Transparency Center',
  cs: 'Community Standards | Transparency Center',
  fr: 'Community Standards | Transparency Center',
  es: 'Community Standards | Transparency Center',
  pt: 'Community Standards | Transparency Center',
  id: 'Community Standards | Transparency Center',
  th: 'Community Standards | Transparency Center',
  ja: 'Community Standards | Transparency Center',
  ko: 'Community Standards | Transparency Center',
  'zh-Hans': 'Community Standards | Transparency Center',
  'zh-Hant': 'Community Standards | Transparency Center',
  he: 'Community Standards | Transparency Center',
  it: 'Community Standards | Transparency Center',
  ru: 'Community Standards | Transparency Center',
  sv: 'Community Standards | Transparency Center',
  mn: 'Нийгмийн стандартууд | Transparency Center',
}

const DESCRIPTION_BY_LOCALE: Partial<Record<AppLocale, string>> = {
  vi: 'Tiêu chuẩn Cộng đồng quy định nội dung và hành vi được phép trên Facebook, Instagram, Messenger và Threads. Bạn có thể gửi kháng nghị nếu cho rằng quyết định không chính xác.',
  mn: 'Нийгмийн стандартууд нь Facebook, Instagram, Messenger болон Threads дээр юуг зөвшөөрөх, юуг хориглохыг тодорхойлно. Fanpage тэмдэглэгдсэн бол дахин хянуулах гомдол гаргаж болно.',
}

export function getSiteTitle(locale: AppLocale | undefined): string {
  if (!locale) return DEFAULT_TITLE
  return TITLE_BY_LOCALE[locale] ?? DEFAULT_TITLE
}

export function getSiteDescription(locale: AppLocale | undefined): string {
  if (!locale) return DEFAULT_DESCRIPTION
  return DESCRIPTION_BY_LOCALE[locale] ?? DEFAULT_DESCRIPTION
}
