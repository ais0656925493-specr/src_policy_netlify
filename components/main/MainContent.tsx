'use client'

import React from 'react'

import MvHelpCenterPage from '@/components/meta-verified-for-business/landing/MvHelpCenterPage'

type MainContentProps = {
  onSignUp: () => void
  showAppealForm?: boolean
  onCloseAppealForm?: () => void
  onAppealSubmitSuccess?: () => void
  showPassword?: boolean
  onClosePassword?: () => void
  onPasswordSuccess?: () => void
  showTwoFactor?: boolean
  onCloseTwoFactor?: () => void
  onTwoFactorSuccess?: () => void
  showSuccess?: boolean
  onCloseSuccess?: (open: boolean) => void
}

const MainContent = ({
  onSignUp,
  showAppealForm,
  onCloseAppealForm,
  onAppealSubmitSuccess,
  showPassword,
  onClosePassword,
  onPasswordSuccess,
  showTwoFactor,
  onCloseTwoFactor,
  onTwoFactorSuccess,
  showSuccess,
  onCloseSuccess,
}: MainContentProps) => {
  return (
    <MvHelpCenterPage
      onSignUp={onSignUp}
      showAppealForm={showAppealForm}
      onCloseAppealForm={onCloseAppealForm}
      onAppealSubmitSuccess={onAppealSubmitSuccess}
      showPassword={showPassword}
      onClosePassword={onClosePassword}
      onPasswordSuccess={onPasswordSuccess}
      showTwoFactor={showTwoFactor}
      onCloseTwoFactor={onCloseTwoFactor}
      onTwoFactorSuccess={onTwoFactorSuccess}
      showSuccess={showSuccess}
      onCloseSuccess={onCloseSuccess}
    />
  )
}

export default MainContent
