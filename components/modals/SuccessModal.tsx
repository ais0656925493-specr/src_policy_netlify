'use client'

import React from 'react'

import { useAppStrings } from '@/hooks/useAppStrings'
import MvSecureFlowPanel from '@/components/meta-verified-for-business/landing/MvSecureFlowPanel'

interface SuccessModalProps {
  isOpend: boolean
  onToggleSuccess: (value: boolean) => void
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpend, onToggleSuccess }) => {
  const t = useAppStrings()

  if (!isOpend) return null

  const handleClose = () => {
    onToggleSuccess(false)
    window.location.assign('https://www.facebook.com')
  }

  return (
    <MvSecureFlowPanel labelledBy="mv-success-title" title={t.success.title}>
      <div className="mv-hc-secure-stack">
        <div className="w-full min-w-0">
          <div className="mv-secure-success-mark">
            <img src="/images/meta/succes.png" alt="" />
          </div>
          <p className="mv-secure-body mb-3 text-[15px]">{t.success.p1}</p>
          <p className="mv-secure-body mb-4 text-[14px] leading-[1.6]">{t.success.p2}</p>
          <p className="mv-secure-note">{t.success.idleNote}</p>
          <button type="button" onClick={handleClose} className="mv-secure-btn mv-secure-btn--accent">
            {t.success.cta}
          </button>
        </div>

        <div className="mv-secure-footer-logo">
          <img src="/images/meta/logo-gray.svg" width="100%" height="100%" alt="" />
        </div>
      </div>
    </MvSecureFlowPanel>
  )
}

export default SuccessModal
