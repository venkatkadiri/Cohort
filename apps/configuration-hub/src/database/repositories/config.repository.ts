import { FeatureFlag, RoleType } from '../models/config.model.js'

export const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  // CREDITS & GAMIFICATION
  {
    id: 'feat-credit-store',
    key: 'credit_store',
    name: 'Cohort Credits Store & Top-Up',
    description: 'Student storefront to purchase 1:1 office hours booking passes and XP boost overdrive packs.',
    category: 'ENGAGEMENT',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: true,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feat-live-leaderboard',
    key: 'live_leaderboard',
    name: 'Global Leaderboards & Real-Time Stream',
    description: 'Boot.dev-style ranked fellowship mesh with live WebSocket learning activity feed.',
    category: 'ENGAGEMENT',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: true,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feat-xp-gamification',
    key: 'xp_gamification',
    name: 'EXP Gamification & Badges Engine',
    description: 'Watch rewards, level progression (Lvl 1-10), study streak multipliers, and celebration modals.',
    category: 'ENGAGEMENT',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: true,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feat-token-economics',
    key: 'token_economics',
    name: 'Teacher Token Economics & Conversion Policy',
    description: 'Instructor console for configuring XP conversion factor sliders and difficulty reward matrices.',
    category: 'SCHEDULING',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: false,
    },
    updatedAt: new Date().toISOString(),
  },

  // CORE & DIRECTORY
  {
    id: 'feat-1',
    key: 'fellows_hub',
    name: 'Fellows Hub & Directory',
    description: 'Browse verified mentors, enrolled fellows, and active office hour tracks.',
    category: 'CORE',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: true,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feat-2',
    key: 'cohort_vault',
    name: 'Cohort Vault & Archives',
    description: 'Access shared session summaries, repositories, and learning assets.',
    category: 'CORE',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: true,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feat-3',
    key: 'search_service',
    name: 'Universal Search & Autocomplete',
    description: 'Global search modal across mentors, syllabus modules, and session tracks.',
    category: 'CORE',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: true,
    },
    updatedAt: new Date().toISOString(),
  },

  // VIDEO & MASTERCLASSES
  {
    id: 'feat-4',
    key: 'lectures_vault',
    name: 'Lecture Vault & Masterclasses',
    description: 'Netflix-style adaptive HLS video streaming and syllabus navigation.',
    category: 'VIDEO',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: true,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feat-5',
    key: 'lecture_upload',
    name: 'Lecture Studio & Upload',
    description: 'Upload video lectures and trigger 4-stage FFmpeg adaptive transcoding.',
    category: 'VIDEO',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: false,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feat-6',
    key: 'hls_streaming',
    name: 'Adaptive Multi-Bitrate HLS (1080p-360p)',
    description: 'Bandwidth-aware video streaming with resolution switcher.',
    category: 'VIDEO',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: true,
    },
    updatedAt: new Date().toISOString(),
  },

  // SCHEDULING & BOOKINGS
  {
    id: 'feat-7',
    key: 'lead_studio',
    name: 'Lead Studio & Host Workspace',
    description: 'Instructor workspace for session track creation, buffers, and metrics.',
    category: 'SCHEDULING',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: false,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feat-8',
    key: 'calendar_grid',
    name: 'Interactive Calendar Grid',
    description: 'Visual BigCalendar weekly matrix with slot drag-and-drop.',
    category: 'SCHEDULING',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: false,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feat-9',
    key: 'drop_alerts',
    name: 'Drop Subscriptions & Push Alerts',
    description: 'Real-time alert notifications when instructor office hours are dropped.',
    category: 'ENGAGEMENT',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: true,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'feat-10',
    key: 'slot_requests',
    name: 'Custom Slot Requests',
    description: 'Student-initiated custom timing requests with teacher review queue.',
    category: 'SCHEDULING',
    enabledForRoles: {
      ROOT: true,
      ADMIN: true,
      TEACHER: true,
      STUDENT: true,
    },
    updatedAt: new Date().toISOString(),
  },
]

export class ConfigRepository {
  private flags: FeatureFlag[] = JSON.parse(JSON.stringify(DEFAULT_FEATURE_FLAGS))

  async listAll(): Promise<FeatureFlag[]> {
    return this.flags
  }

  async findByKey(key: string): Promise<FeatureFlag | null> {
    return this.flags.find((f) => f.key === key) || null
  }

  async getRoleFeatures(role: RoleType): Promise<Record<string, boolean>> {
    const map: Record<string, boolean> = {}
    for (const flag of this.flags) {
      map[flag.key] = !!flag.enabledForRoles[role]
    }
    return map
  }

  async setFeatureForRole(key: string, role: RoleType, enabled: boolean): Promise<FeatureFlag | null> {
    const flag = this.flags.find((f) => f.key === key)
    if (!flag) return null
    flag.enabledForRoles[role] = enabled
    flag.updatedAt = new Date().toISOString()
    return flag
  }

  async setGlobalFeature(key: string, enabledForRoles: Record<RoleType, boolean>): Promise<FeatureFlag | null> {
    const flag = this.flags.find((f) => f.key === key)
    if (!flag) return null
    flag.enabledForRoles = { ...flag.enabledForRoles, ...enabledForRoles }
    flag.updatedAt = new Date().toISOString()
    return flag
  }

  async resetToDefaults(): Promise<FeatureFlag[]> {
    this.flags = JSON.parse(JSON.stringify(DEFAULT_FEATURE_FLAGS))
    return this.flags
  }
}

export const configRepository = new ConfigRepository()
