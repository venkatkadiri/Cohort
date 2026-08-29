export type RoleType = 'ROOT' | 'ADMIN' | 'TEACHER' | 'STUDENT'

export type FeatureCategory = 'CORE' | 'VIDEO' | 'SCHEDULING' | 'ENGAGEMENT' | 'DEVELOPER'

export interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string
  category: FeatureCategory
  enabledForRoles: Record<RoleType, boolean>
  isSystemCritical?: boolean
  updatedAt: string
}

export interface RoleConfigSummary {
  role: RoleType
  displayName: string
  description: string
  features: Record<string, boolean>
}
