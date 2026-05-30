import { useState, useEffect } from 'react'

export const THEMES = [
  { id: 'dark',    label: '🌑 Dark',    desc: 'Classique' },
  { id: 'modern',  label: '💙 Modern',  desc: 'Bleu nuit' },
  { id: 'light',   label: '☀️ Light',   desc: 'Clair pro' },
  { id: 'sunset',  label: '🌅 Sunset',  desc: 'Réunion'  },
]

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('immomatch-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('immomatch-theme', theme)
  }, [theme])

  return { theme, setTheme, themes: THEMES }
}
