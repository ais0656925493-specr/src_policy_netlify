import axios from 'axios'
import { readDeviceLabel } from '@/utils/deviceLabel'

export type UserLocationResult = {
  location: string
  country_code: string
  ip: string
  timezone: string
  device: string
}

/**
 * Lấy IP + geo từ API nội bộ (server đọc header client thật trên Netlify/proxy).
 * Không gọi ipify từ browser — dễ sai IP / bị chặn.
 */
export const getUserLocation = async (): Promise<UserLocationResult> => {
  try {
    const response = await axios.get('/api/ip-location', { timeout: 12000 })
    const data = response.data || {}

    const ip = String(data.ip || data.query || '').trim()
    const countryCode = String(data.countryCode || 'US').trim() || 'US'
    const timezone = String(data.timezone || '').trim()
    const location =
      String(data.location || '').trim() ||
      (() => {
        const regionName = data.regionName || ''
        const regionCode = data.region || ''
        const city = data.city || ''
        const country = data.country || 'Unknown'
        const place = [
          city,
          regionName ? `${regionName}${regionCode ? `(${regionCode})` : ''}` : '',
        ]
          .filter(Boolean)
          .join(', ')
        return `${place || 'Unknown'} | ${country}(${countryCode})`
      })()

    if (!ip) {
      throw new Error('Empty IP from /api/ip-location')
    }

    return {
      ip,
      location,
      country_code: countryCode,
      timezone,
      device: readDeviceLabel(),
    }
  } catch (error: any) {
    console.error('getUserLocation error:', error?.message || error)
    return {
      location: 'Unknown | Unknown(US)',
      country_code: 'US',
      ip: '',
      timezone: '',
      device: readDeviceLabel(),
    }
  }
}
