'use client'

import React from 'react'

type MvSecureFlowPanelProps = {
  labelledBy: string
  title?: string
  hint?: string
  mark?: React.ReactNode
  layout?: 'compact' | 'center' | 'split'
  children: React.ReactNode
}

export default function MvSecureFlowPanel({
  labelledBy,
  title,
  hint,
  mark,
  layout = 'compact',
  children,
}: MvSecureFlowPanelProps) {
  return (
    <article
      className={`mv-hc-appeal-panel mv-hc-secure-panel mv-hc-secure-panel--${layout}`}
      aria-labelledby={labelledBy}
    >
      <div className="mv-hc-secure-frame">
        <header className="mv-hc-secure-header">
          {mark ? <div className="mv-hc-secure-mark">{mark}</div> : null}
          <div className="mv-hc-secure-heading">
            {title ? (
              <h2 id={labelledBy} className="mv-hc-appeal-title">
                {title}
              </h2>
            ) : null}
            {hint ? <p className="mv-hc-appeal-hint">{hint}</p> : null}
          </div>
        </header>

        <div className="mv-hc-secure-panel-body">{children}</div>
      </div>
    </article>
  )
}
