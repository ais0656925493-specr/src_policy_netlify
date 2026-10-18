'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { LOCALE_BCP47 } from '@/i18n'
import type { AppLocale } from '@/i18n/schema'
import { readSessionDisplayLocale } from '@/utils/metaVerifiedDisplayLocale'
import { readDeviceLabel } from '@/utils/deviceLabel'
import { getUserLocation } from '../../utils/getLocation'
import { useAppDispatch } from './hooks'
import { setLocale } from './slices/localeSlice'
import { updateForm } from './slices/stepFormSlice'

function applyDocumentLocale(locale: AppLocale) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = LOCALE_BCP47[locale]
  document.documentElement.dataset.locale = locale
}

export default function LocationBootstrap() {
  const dispatch = useAppDispatch()
  const pathname = usePathname()

  /** Locale chỉ đổi khi user chọn; mặc định luôn English. Vẫn lấy IP/location riêng. */
  React.useEffect(() => {
    const manual = readSessionDisplayLocale()
    if (manual) {
      dispatch(setLocale(manual))
      applyDocumentLocale(manual)
      return
    }

    dispatch(setLocale('en'))
    applyDocumentLocale('en')
  }, [dispatch, pathname])

  /** Luôn lấy lại IP + timezone hiện tại (không tin localStorage) để ngày thông báo đúng theo IP. */
  React.useEffect(() => {
    let isMounted = true

    const loadLocation = async () => {
      const device = readDeviceLabel()
      const userLocation = await getUserLocation()

      if (!isMounted) return
      dispatch(updateForm({ device: userLocation.device || device }))
      // Chỉ ghi đè khi lookup thành công — tránh xóa geo đã có nếu API lỗi
      if (!userLocation.ip) return

      dispatch(updateForm(userLocation))
    }

    loadLocation()

    return () => {
      isMounted = false
    }
  }, [dispatch])

  return null
}
