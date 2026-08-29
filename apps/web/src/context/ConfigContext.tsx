import React, { createContext, useContext, useState, useEffect } from 'react'

export type RoleType = 'ROOT' | 'ADMIN' | 'TEACHER' | 'STUDENT'

export type FeatureKey =
  | 'fellows_hub'
  | 'cohort_vault'
  | 'search_service'
  | 'lectures_vault'
  | 'lecture_upload'
  | 'hls_streaming'
  | 'lead_studio'
  | 'calendar_grid'
  | 'drop_alerts'
  | 'slot_requests'

export interface FeatureFlagMeta {
  key: FeatureKey
  name: string
  description: string
  category: 'CORE' | 'VIDEO' | 'SCHEDULING' | 'ENGAGEMENT'
}

export const FEATURE_REGISTRY: FeatureFlagMeta[] = [
  // CORE
  {
    key: 'fellows_hub',
    name: 'Fellows Hub & Mentors Directory',
    description: 'Browse verified cohort mentors, enrolled fellows, and active office hour tracks.',
    category: 'CORE',
  },
  {
    key: 'cohort_vault',
    name: 'Cohort Vault & Learning Archives',
    description: 'Access shared session summaries, repositories, and learning assets.',
    category: 'CORE',
  },
  {
    key: 'search_service',
    name: 'Universal Search & Autocomplete',
    description: 'Global search modal across mentors, syllabus modules, and session tracks.',
    category: 'CORE',
  },

  // VIDEO
  {
    key: 'lectures_vault',
    name: 'Lecture Vault & Masterclasses',
    description: 'Netflix-style adaptive HLS video streaming and syllabus navigation.',
    category: 'VIDEO',
  },
  {
    key: 'lecture_upload',
    name: 'Lecture Studio & Upload',
    description: 'Upload video lectures and trigger 4-stage FFmpeg adaptive transcoding.',
    category: 'VIDEO',
  },
  {
    key: 'hls_streaming',
    name: 'Multi-Bitrate HLS Engine (1080p-360p)',
    description: 'Bandwidth-aware video streaming with resolution switcher.',
    category: 'VIDEO',
  },

  // SCHEDULING
  {
    key: 'lead_studio',
    name: 'Lead Studio & Host Workspace',
    description: 'Instructor workspace for session track creation, buffers, and metrics.',
    category: 'SCHEDULING',
  },
  {
    key: 'calendar_grid',
    name: 'Interactive Calendar Grid',
    description: 'Visual BigCalendar weekly matrix with slot drag-and-drop.',
    category: 'SCHEDULING',
  },
  {
    key: 'slot_requests',
    name: 'Custom Slot Requests',
    description: 'Student-initiated custom timing requests with teacher review queue.',
    category: 'SCHEDULING',
  },

  // ENGAGEMENT
  {
    key: 'drop_alerts',
    name: 'Drop Subscriptions & Push Alerts',
    description: 'Real-time alert notifications when instructor office hours are dropped.',
    category: 'ENGAGEMENT',
  },
]

export const DEFAULT_ROLE_FLAGS: Record<RoleType, Record<FeatureKey, boolean>> = {
  ROOT: {
    fellows_hub: true,
    cohort_vault: true,
    search_service: true,
    lectures_vault: true,
    lecture_upload: true,
    hls_streaming: true,
    lead_studio: true,
    calendar_grid: true,
    drop_alerts: true,
    slot_requests: true,
  },
  ADMIN: {
    fellows_hub: true,
    cohort_vault: true,
    search_service: true,
    lectures_vault: true,
    lecture_upload: true,
    hls_streaming: true,
    lead_studio: true,
    calendar_grid: true,
    drop_alerts: true,
    slot_requests: true,
  },
  TEACHER: {
    fellows_hub: true,
    cohort_vault: true,
    search_service: true,
    lectures_vault: true,
    lecture_upload: true,
    hls_streaming: true,
    lead_studio: true,
    calendar_grid: true,
    drop_alerts: true,
    slot_requests: true,
  },
  STUDENT: {
    fellows_hub: true,
    cohort_vault: true,
    search_service: true,
    lectures_vault: true,
    lecture_upload: false,
    hls_streaming: true,
    lead_studio: false,
    calendar_grid: false,
    drop_alerts: true,
    slot_requests: true,
  },
}

interface ConfigContextType {
  currentRole: RoleType
  setCurrentRole: (role: RoleType) => void
  flags: Record<RoleType, Record<FeatureKey, boolean>>
  isFeatureEnabled: (key: FeatureKey, roleOverride?: RoleType) => boolean
  toggleFeature: (key: FeatureKey, role?: RoleType) => void
  setFeature: (key: FeatureKey, role: RoleType, enabled: boolean) => void
  setAllForRole: (role: RoleType, enabled: boolean) => void
  resetToDefaults: () => void
}

const ConfigContext = createContext<ConfigContextType | null>(null)

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<RoleType>('TEACHER')
  const [flags, setFlags] = useState<Record<RoleType, Record<FeatureKey, boolean>>>(DEFAULT_ROLE_FLAGS)

  // Load persisted flags from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cohort_feature_flags_v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        setFlags((prev) => ({
          ...prev,
          ...parsed,
        }))
      }
      const savedRole = localStorage.getItem('cohort_active_role') as RoleType | null
      if (savedRole && ['ROOT', 'ADMIN', 'TEACHER', 'STUDENT'].includes(savedRole)) {
        setCurrentRole(savedRole)
      }
    } catch {}
  }, [])

  const persistFlags = (newFlags: Record<RoleType, Record<FeatureKey, boolean>>) => {
    setFlags(newFlags)
    try {
      localStorage.setItem('cohort_feature_flags_v1', JSON.stringify(newFlags))
    } catch {}
  }

  const handleSetCurrentRole = (role: RoleType) => {
    setCurrentRole(role)
    try {
      localStorage.setItem('cohort_active_role', role)
    } catch {}
  }

  const isFeatureEnabled = (key: FeatureKey, roleOverride?: RoleType): boolean => {
    const role = roleOverride || currentRole
    return !!flags[role]?.[key]
  }

  const toggleFeature = (key: FeatureKey, role?: RoleType) => {
    const targetRole = role || currentRole
    const nextState = !flags[targetRole]?.[key]
    const updated = {
      ...flags,
      [targetRole]: {
        ...flags[targetRole],
        [key]: nextState,
      },
    }
    persistFlags(updated)
  }

  const setFeature = (key: FeatureKey, role: RoleType, enabled: boolean) => {
    const updated = {
      ...flags,
      [role]: {
        ...flags[role],
        [key]: enabled,
      },
    }
    persistFlags(updated)
  }

  const setAllForRole = (role: RoleType, enabled: boolean) => {
    const roleFlags = { ...flags[role] }
    for (const key of Object.keys(roleFlags) as FeatureKey[]) {
      roleFlags[key] = enabled
    }
    persistFlags({
      ...flags,
      [role]: roleFlags,
    })
  }

  const resetToDefaults = () => {
    persistFlags(DEFAULT_ROLE_FLAGS)
  }

  return (
    <ConfigContext.Provider
      value={{
        currentRole,
        setCurrentRole: handleSetCurrentRole,
        flags,
        isFeatureEnabled,
        toggleFeature,
        setFeature,
        setAllForRole,
        resetToDefaults,
      }}
    >
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return ctx
}
