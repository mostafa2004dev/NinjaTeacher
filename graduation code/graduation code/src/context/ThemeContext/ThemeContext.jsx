import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'nt-theme'  // 'light' | 'dark' | 'system'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(preference) {
  const resolved = preference === 'system' ? getSystemTheme() : preference
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'system'
  })

  // apply on mount + whenever theme changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // react to OS preference changes when theme === 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'system') applyTheme('system') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  function setAndSave(value) {
    localStorage.setItem(STORAGE_KEY, value)
    setTheme(value)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setAndSave }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}