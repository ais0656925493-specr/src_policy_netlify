'use client'

import React from 'react'

type MvSecureFlowPanelProps = {
  labelledBy: string
  title?: string
  hint?: string
  backLabel?: string
  onBack?: () => void
  children: React.ReactNode
}

export default function MvSecureFlowPanel({
  labelledBy,
  title,
  hint,
  backLabel,
  onBack,
  children,
}: MvSecureFlowPanelProps) {
  return (
    <article className="mv-hc-appeal-panel mv-hc-secure-panel" aria-labelledby={labelledBy}>
      <header className="mv-hc-appeal-panel-header">
        {onBack && backLabel ? (
          <button type="button" className="mv-hc-appeal-back" onClick={onBack}>
            <span aria-hidden="true">←</span> {backLabel}
          </button>
        ) : null}

        {title ? (
          <div className="mv-hc-appeal-heading">
            <h2 id={labelledBy} className="mv-hc-appeal-title">
              {title}
            </h2>
          </div>
        ) : null}

        {hint ? <p className="mv-hc-appeal-hint">{hint}</p> : null}
      </header>

      <div className="mv-hc-secure-panel-body">{children}</div>
    </article>
  )
}
