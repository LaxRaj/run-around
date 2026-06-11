import JoinForm from '@/components/JoinForm';

/* ─── Design tokens ──────────────────────────────────────────────── */
const C = {
  ink:     '#0A0A0F',
  surface: '#111118',
  raised:  '#1A1A25',
  accent:  '#6C3EFF',
  violet:  '#9D6FFF',
  dim:     '#8B8B9A',
  muted:   '#4A4A5A',
  emerald: '#22D3A5',
  amber:   '#F59E0B',
  rose:    '#FF3B6E',
  border:  'rgba(255,255,255,0.06)',
  borderA: 'rgba(108,62,255,0.4)',
} as const;

/* ─── Shared layout helpers ──────────────────────────────────────── */
const container: React.CSSProperties = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '0 24px',
};

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function Page() {
  return (
    <div style={{ background: C.ink, minHeight: '100vh', overflowX: 'hidden' }}>
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <Footer />
    </div>
  );
}

/* ─── Nav ────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        borderBottom: `1px solid ${C.border}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(10,10,15,0.7)',
      }}
    >
      <div style={{ ...container, display: 'flex', alignItems: 'center', height: 60 }}>
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.8px',
            color: '#fff',
          }}
        >
          run-around
          <span style={{ color: C.accent }}>.</span>
        </span>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 100,
        paddingBottom: 80,
        overflow: 'hidden',
      }}
    >
      {/* Glow blobs */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -120,
          right: -160,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,62,255,0.18) 0%, transparent 70%)',
          animation: 'drift-a 14s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -80,
          left: -100,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(157,111,255,0.10) 0%, transparent 70%)',
          animation: 'drift-b 18s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative route SVG */}
      <RouteIllustration />

      {/* Content */}
      <div style={{ ...container, position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px 5px 8px',
            borderRadius: 999,
            border: `1px solid ${C.borderA}`,
            background: 'rgba(108,62,255,0.07)',
            marginBottom: 32,
            animation: 'fade-up 0.6s 0.1s ease both',
          }}
        >
          <span
            style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: C.emerald,
              boxShadow: `0 0 6px ${C.emerald}`,
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.dim, letterSpacing: '0.5px' }}>
            NOW BUILDING — JOIN EARLY
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(52px, 9vw, 108px)',
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: '-3px',
            color: '#fff',
            maxWidth: 780,
            marginBottom: 24,
            animation: 'fade-up 0.7s 0.2s ease both',
          }}
        >
          every run,{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${C.accent} 0%, ${C.violet} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            a new loop
          </span>
          <span style={{ color: C.accent, WebkitTextFillColor: C.accent }}>.</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 18,
            fontWeight: 400,
            color: C.dim,
            maxWidth: 460,
            lineHeight: 1.65,
            marginBottom: 40,
            animation: 'fade-up 0.7s 0.35s ease both',
          }}
        >
          Drop your pin. Pick your distance. run-around plots a round-trip
          route that starts and ends exactly where you stand.
        </p>

        {/* Form */}
        <div style={{ maxWidth: 520, animation: 'fade-up 0.7s 0.5s ease both' }}>
          <JoinForm />
          <p
            style={{
              marginTop: 12,
              fontSize: 12,
              color: C.muted,
              letterSpacing: '0.2px',
            }}
          >
            No spam. Just a heads-up when we launch.
          </p>
        </div>

        {/* Stat strip */}
        <div
          style={{
            display: 'flex',
            gap: 32,
            marginTop: 64,
            animation: 'fade-up 0.7s 0.65s ease both',
            flexWrap: 'wrap',
          }}
        >
          {[
            { value: '< 3s', label: 'route generation' },
            { value: '∞',    label: 'unique loops' },
            { value: '100%', label: 'round-trip' },
          ].map(({ value, label }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: '-1px',
                  color: '#fff',
                  lineHeight: 1,
                }}
              >
                {value}
              </span>
              <span style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Route illustration (decorative SVG) ────────────────────────── */
function RouteIllustration() {
  return (
    <svg
      viewBox="0 0 520 520"
      fill="none"
      aria-hidden
      style={{
        position: 'absolute',
        right: '-4%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 'min(520px, 52vw)',
        height: 'auto',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Outer glow */}
      <path
        d="M 260,60 C 360,40 450,110 460,210 C 472,320 410,420 310,450 C 210,480 110,430 72,340 C 34,250 60,130 140,84 C 175,65 218,56 260,60 Z"
        stroke={C.accent}
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.07"
        strokeDasharray="12 6"
      />
      {/* Main route */}
      <path
        d="M 260,60 C 360,40 450,110 460,210 C 472,320 410,420 310,450 C 210,480 110,430 72,340 C 34,250 60,130 140,84 C 175,65 218,56 260,60 Z"
        stroke={C.accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1500"
        strokeOpacity="0.7"
        style={{
          animation: 'route-draw 3.5s 0.8s cubic-bezier(0.4,0,0.2,1) both',
        }}
      />
      {/* Inner shortcut path */}
      <path
        d="M 260,60 C 240,140 200,200 200,260 C 200,320 240,380 310,450"
        stroke={C.violet}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="800"
        strokeOpacity="0.35"
        style={{
          animation: 'route-draw 2.5s 1.8s ease both',
        }}
      />
      {/* Start/finish dot */}
      <circle cx="260" cy="60" r="5" fill={C.accent} opacity="0.9"
        style={{ animation: 'route-draw 0.4s 4s ease both' }}
      />
      <circle cx="260" cy="60" r="12" stroke={C.accent} strokeWidth="1.5" strokeOpacity="0.3"
        style={{ animation: 'route-draw 0.4s 4.1s ease both' }}
      />
      {/* Measurement tick marks */}
      {[
        { x1: 462, y1: 200, x2: 476, y2: 198 },
        { x1: 415, y1: 415, x2: 424, y2: 426 },
        { x1: 70, y1: 335, x2: 56, y2: 340 },
      ].map(({ x1, y1, x2, y2 }, i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={C.violet}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
      ))}
      {/* Grid dots */}
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={80 + col * 72}
            cy={80 + row * 72}
            r="1.2"
            fill={C.muted}
            opacity="0.25"
          />
        ))
      )}
    </svg>
  );
}

/* ─── How it works ───────────────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    icon: '📍',
    title: 'Drop a pin',
    desc: 'Open the app anywhere. Your GPS position becomes the start and finish line.',
  },
  {
    num: '02',
    icon: '⚡',
    title: 'Pick your miles',
    desc: 'Slide to your distance, choose your difficulty. Easy flat loops to brutal hill climbs.',
  },
  {
    num: '03',
    icon: '🔄',
    title: 'Run the loop',
    desc: 'A fresh round-trip route is plotted in under 3 seconds. Regenerate any time.',
  },
];

function HowItWorks() {
  return (
    <section style={{ padding: '100px 0', position: 'relative' }}>
      <div style={container}>
        {/* Section label */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '1.8px',
            color: C.accent,
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          How it works
        </p>
        <h2
          style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            lineHeight: 1.05,
            marginBottom: 60,
          }}
        >
          Three taps to go time.
        </h2>

        {/* Steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 2,
            position: 'relative',
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              style={{
                position: 'relative',
                padding: '32px',
                background: i === 1 ? C.surface : 'transparent',
                border: `1px solid ${i === 1 ? C.borderA : C.border}`,
                borderRadius: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '2px',
                    color: i === 1 ? C.accent : C.muted,
                  }}
                >
                  {step.num}
                </span>
                <span style={{ fontSize: 24 }}>{step.icon}</span>
              </div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: '-0.4px',
                  color: '#fff',
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.65 }}>
                {step.desc}
              </p>
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    right: -18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: C.raised,
                    border: `1px solid ${C.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    color: C.muted,
                    zIndex: 1,
                  }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────────────────────── */
const FEATURES = [
  {
    stat: '100%',
    statColor: C.violet,
    title: 'Round-trip guaranteed',
    desc: 'Every route starts and ends at your exact GPS coordinate. Never strand yourself.',
    tag: 'ROUTING',
    tagColor: C.violet,
  },
  {
    stat: '< 3s',
    statColor: C.emerald,
    title: 'Instant generation',
    desc: 'Powered by OpenRouteService — real road and trail data, not guesswork.',
    tag: 'SPEED',
    tagColor: C.emerald,
  },
  {
    stat: '∞',
    statColor: C.amber,
    title: 'Infinite variety',
    desc: 'A new random seed each time means you\'ll never run the exact same loop twice.',
    tag: 'VARIETY',
    tagColor: C.amber,
  },
];

function Features() {
  return (
    <section style={{ padding: '0 0 120px' }}>
      <div style={container}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '1.8px',
            color: C.accent,
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          Why run-around
        </p>
        <h2
          style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            lineHeight: 1.05,
            marginBottom: 48,
          }}
        >
          Built for runners who hate planning.
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="card" style={{ padding: '32px' }}>
              {/* Tag */}
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '1.6px',
                  color: f.tagColor,
                  background: `${f.tagColor}14`,
                  border: `1px solid ${f.tagColor}33`,
                  borderRadius: 999,
                  padding: '3px 10px',
                  marginBottom: 24,
                }}
              >
                {f.tag}
              </span>
              {/* Big stat */}
              <div
                style={{
                  fontSize: 'clamp(52px, 7vw, 72px)',
                  fontWeight: 800,
                  letterSpacing: '-2px',
                  lineHeight: 1,
                  color: f.statColor,
                  marginBottom: 16,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {f.stat}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '-0.3px',
                  marginBottom: 10,
                  color: '#fff',
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${C.border}`,
        padding: '28px 24px',
      }}
    >
      <div
        style={{
          ...container,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.4px', color: '#fff' }}>
          run-around<span style={{ color: C.accent }}>.</span>
        </span>
        <span style={{ fontSize: 12, color: C.muted }}>
          © {new Date().getFullYear()} run-around. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
