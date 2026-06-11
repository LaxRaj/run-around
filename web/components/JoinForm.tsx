'use client';

import { useState, useRef } from 'react';

type State = 'idle' | 'loading' | 'success' | 'error';

export default function JoinForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Enter a valid email address.');
      inputRef.current?.focus();
      return;
    }
    setErrorMsg('');
    setState('loading');
    // Simulated async — swap for real API call later
    await new Promise((r) => setTimeout(r, 1100));
    setState('success');
  }

  if (state === 'success') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '12px',
          animation: 'fade-up 0.5s ease both',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            background: 'rgba(34,211,165,0.08)',
            border: '1px solid rgba(34,211,165,0.25)',
            borderRadius: '14px',
          }}
        >
          {/* Animated checkmark */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#22D3A5" strokeWidth="1.5" />
            <path
              d="M 6 10 L 9 13 L 14 7"
              stroke="#22D3A5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="60"
              style={{ animation: 'check-draw 0.4s 0.1s ease both' }}
            />
          </svg>
          <span style={{ color: '#22D3A5', fontSize: '14px', fontWeight: 600 }}>
            You&apos;re on the list.
          </span>
        </div>
        <p style={{ color: '#8B8B9A', fontSize: '13px', lineHeight: 1.5 }}>
          We&apos;ll reach out at <strong style={{ color: '#fff' }}>{email}</strong> when
          run-around is ready to run.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <input
            ref={inputRef}
            className="input-field"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            disabled={state === 'loading'}
            autoComplete="email"
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={state === 'loading'}
          style={{ flex: '0 0 auto' }}
        >
          {state === 'loading' ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ animation: 'spin 0.7s linear infinite' }}
              >
                <circle
                  cx="8" cy="8" r="6"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="2"
                />
                <path
                  d="M 8 2 A 6 6 0 0 1 14 8"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Joining…
            </>
          ) : (
            'Join the waitlist →'
          )}
        </button>
      </div>

      {errorMsg && (
        <p
          style={{
            marginTop: '8px',
            color: '#FF3B6E',
            fontSize: '13px',
            animation: 'fade-up 0.2s ease both',
          }}
        >
          {errorMsg}
        </p>
      )}
    </form>
  );
}
