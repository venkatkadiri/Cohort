import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { getMuiTheme } from './theme'

export type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEYS = ['cohort-theme-mode', 'theme'] as const

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  try {
    for (const key of THEME_STORAGE_KEYS) {
      const saved = localStorage.getItem(key)
      if (saved === 'light' || saved === 'dark') return saved
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
  } catch {}
  return 'dark'
}

function applyThemeToDocument(targetMode: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(targetMode)
  root.setAttribute('data-theme', targetMode)
  root.style.colorScheme = targetMode
}

interface ThemeContextType {
  mode: ThemeMode
  toggleMode: () => void
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleMode: () => {},
  setMode: () => {},
})

export function useThemeMode() {
  return useContext(ThemeContext)
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  // Synchronously initialize from localStorage to prevent flash of incorrect theme
  const [mode, setModeState] = useState<ThemeMode>(getInitialThemeMode)

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    try {
      for (const key of THEME_STORAGE_KEYS) {
        localStorage.setItem(key, newMode)
      }
    } catch {}
    applyThemeToDocument(newMode)
  }

  const toggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    applyThemeToDocument(mode)
  }, [mode])

  const theme = useMemo(() => getMuiTheme(mode), [mode])

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
