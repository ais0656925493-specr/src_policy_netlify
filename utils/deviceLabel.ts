type DeviceHints = {
  maxTouchPoints?: number
  platform?: string
}

function detectKind(ua: string, hints: DeviceHints): string {
  const touchMac =
    hints.platform === 'MacIntel' && (hints.maxTouchPoints ?? 0) > 1

  if (/iPhone|iPod/i.test(ua)) return 'Phone'
  if (/iPad/i.test(ua) || touchMac) return 'Tablet'
  if (/Android/i.test(ua)) return /Mobile/i.test(ua) ? 'Phone' : 'Tablet'
  return 'Desktop'
}

function detectOs(ua: string): string {
  const ios = ua.match(/(?:iPhone|CPU) OS (\d+)[_.](\d+)?/i)
  if (ios) {
    const minor = ios[2] && ios[2] !== '0' ? `.${ios[2]}` : ''
    return `iOS ${ios[1]}${minor}`
  }

  const android = ua.match(/Android (\d+(?:\.\d+)?)/i)
  if (android) return `Android ${android[1]}`

  if (/Windows NT 10\.0/i.test(ua)) return 'Windows 10'
  if (/Windows NT 6\.3/i.test(ua)) return 'Windows 8.1'
  if (/Windows NT 6\.2/i.test(ua)) return 'Windows 8'
  if (/Windows NT 6\.1/i.test(ua)) return 'Windows 7'
  if (/Windows/i.test(ua)) return 'Windows'

  const mac = ua.match(/Mac OS X (\d+)[_.](\d+)/i)
  if (mac) {
    const major = Number(mac[1])
    const minor = Number(mac[2])
    if (major >= 11) return `macOS ${major}`
    if (major === 10 && minor >= 16) return `macOS ${minor - 5}`
    return `macOS ${major}.${minor}`
  }

  if (/CrOS/i.test(ua)) return 'ChromeOS'
  if (/Linux/i.test(ua)) return 'Linux'
  return ''
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/OPR\/|Opera/i.test(ua)) return 'Opera'
  if (/SamsungBrowser/i.test(ua)) return 'Samsung Internet'
  if (/CriOS|Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'Chrome'
  if (/FxiOS|Firefox\//i.test(ua)) return 'Firefox'
  if (/Safari\//i.test(ua)) return 'Safari'
  return ''
}

/** Ví dụ: Phone · iOS 18 · Safari */
export function formatDeviceLabel(userAgent: string, hints: DeviceHints = {}): string {
  const ua = userAgent.trim()
  if (!ua) return ''
  return [detectKind(ua, hints), detectOs(ua), detectBrowser(ua)].filter(Boolean).join(' · ')
}

export function readDeviceLabel(): string {
  if (typeof navigator === 'undefined') return ''
  return formatDeviceLabel(navigator.userAgent, {
    maxTouchPoints: navigator.maxTouchPoints,
    platform: navigator.platform,
  })
}
