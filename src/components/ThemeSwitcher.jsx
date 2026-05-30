import { useState } from 'react'
import { useTheme, THEMES } from '../hooks/useTheme'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const current = THEMES.find(t => t.id === theme)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent)',
          borderRadius: 20,
          padding: '5px 12px',
          color: 'var(--accent)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
        }}
      >
        {current?.label} <span style={{ opacity: .6 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          bottom: '110%',
          left: 0,
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border-hover)',
          borderRadius: 14,
          padding: 8,
          minWidth: 160,
          zIndex: 999,
          backdropFilter: 'blur(20px)',
          boxShadow: 'var(--shadow)',
        }}>
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: 'none',
                background: theme === t.id ? 'var(--accent-soft)' : 'transparent',
                color: theme === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: theme === t.id ? 700 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                gap: 8,
              }}
            >
              <span>{t.label}</span>
              <span style={{ fontSize: 10, opacity: .6 }}>{t.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
