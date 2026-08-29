import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'

export type UserRole = 'teacher' | 'student' | 'guest'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'teacher' | 'student'
  slug?: string
  timezone?: string
}

interface AuthContextValue {
  user: AuthUser | null
  role: UserRole
  isAuthenticated: boolean
  isTeacher: boolean
  isStudent: boolean
  isAuthModalOpen: boolean
  authModalTab: 'login' | 'register'
  openAuthModal: (tab?: 'login' | 'register') => void
  closeAuthModal: () => void
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_STORAGE_KEY = 'cohort_auth_session'
const LOGGED_OUT_KEY = 'cohort_logged_out'

// Default seed personas for 1-click test login
export const PRESET_USERS: AuthUser[] = [
  {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@lovelace.dev',
    role: 'teacher',
    slug: 'ada',
    timezone: 'UTC',
  },
  {
    id: 2,
    name: 'Grace Hopper',
    email: 'grace@hopper.dev',
    role: 'teacher',
    slug: 'grace',
    timezone: 'America/New_York',
  },
  {
    id: 1,
    name: 'Grace Admissions',
    email: 'admissions@hopper.dev',
    role: 'student',
    timezone: 'America/New_York',
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return PRESET_USERS[0]
    try {
      const isExplicitlyLoggedOut = localStorage.getItem(LOGGED_OUT_KEY)
      if (isExplicitlyLoggedOut === '1') {
        return null
      }
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {}
    return PRESET_USERS[0]
  })

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login')

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
        localStorage.removeItem(LOGGED_OUT_KEY)
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    } catch {}
  }, [user])

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab)
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
  }, [])

  const login = useCallback((authUser: AuthUser) => {
    try {
      localStorage.removeItem(LOGGED_OUT_KEY)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser))
    } catch {}
    setUser(authUser)
    setIsAuthModalOpen(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      localStorage.setItem(LOGGED_OUT_KEY, '1')
      localStorage.removeItem('demoSession')
      localStorage.removeItem('enrollerId')
      localStorage.removeItem('cohort:hostId')
      localStorage.removeItem('cohort_active_role')
    } catch {}

    // Immediately redirect to home page and reset window state
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }, [])

  const role: UserRole = user ? user.role : 'guest'
  const isTeacher = role === 'teacher'
  const isStudent = role === 'student'
  const isAuthenticated = !!user

  const value = useMemo(
    () => ({
      user,
      role,
      isAuthenticated,
      isTeacher,
      isStudent,
      isAuthModalOpen,
      authModalTab,
      openAuthModal,
      closeAuthModal,
      login,
      logout,
    }),
    [
      user,
      role,
      isAuthenticated,
      isTeacher,
      isStudent,
      isAuthModalOpen,
      authModalTab,
      openAuthModal,
      closeAuthModal,
      login,
      logout,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
