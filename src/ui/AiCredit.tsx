import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type ModelId = 'anthropic' | 'haiku' | 'sonnet'

const COPY: Record<ModelId, { kicker: string; title: string; code: string; line: string }> = {
  anthropic: {
    kicker: 'Powered by',
    title: 'Anthropic',
    code: 'Haiku 5.5  ·  Sonnet 5.5',
    line: 'Her voice is Claude. Haiku 5.5 while she is a cat, Sonnet 5.5 after she awakens. One company, so it grows up instead of changing brands.',
  },
  haiku: {
    kicker: 'Claude',
    title: 'Haiku 5.5',
    code: 'claude-haiku-5-5',
    line: 'She speaks with Haiku 5.5 while she is still a cat. One short line. She hears what was said, and she still sounds hungry, lonely, or pleased.',
  },
  sonnet: {
    kicker: 'Claude',
    title: 'Sonnet 5.5',
    code: 'claude-sonnet-5-5',
    line: 'She speaks with Sonnet 5.5 after she awakens. Same name, same memories. She has room to answer, and she can bring up a bond, a moment, or a time you were away.',
  },
}

export function AiCredit() {
  const [open, setOpen] = useState<ModelId | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const model = open ? COPY[open] : null

  return (
    <>
      <div className="ai-credit">
        <span className="ai-credit__lead">powered by</span>
        <button type="button" className="ai-credit__brand" aria-label="Anthropic" onClick={() => setOpen('anthropic')}>
          <img src="/brand/anthropic-wordmark.svg" alt="" />
        </button>
        <button type="button" className="ai-credit__model" onClick={() => setOpen('haiku')}>
          <img src="/brand/claude-symbol.svg" alt="" />
          <span>Haiku 5.5</span>
        </button>
        <button type="button" className="ai-credit__model" onClick={() => setOpen('sonnet')}>
          <img src="/brand/claude-symbol.svg" alt="" />
          <span>Sonnet 5.5</span>
        </button>
      </div>
      {model && open
        ? createPortal(
            <div className="ai-modal" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
              <button type="button" className="ai-modal__scrim" aria-label="Close" onClick={() => setOpen(null)} />
              <div className="ai-modal__card">
                <img
                  className={`ai-modal__mark${open === 'anthropic' ? ' is-word' : ''}`}
                  src={open === 'anthropic' ? '/brand/anthropic-wordmark.svg' : '/brand/claude-symbol.svg'}
                  alt=""
                />
                <p className="ai-modal__kicker">{model.kicker}</p>
                <h2 id="ai-modal-title">{model.title}</h2>
                <p className="ai-modal__code">{model.code}</p>
                <p className="ai-modal__line">{model.line}</p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
