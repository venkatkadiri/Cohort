import { configRepository } from '../database/repositories/config.repository.js'
import { FeatureFlag, RoleType, RoleConfigSummary } from '../database/models/config.model.js'
import { logger } from '../utils/logger.js'

export class ConfigService {
  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return configRepository.listAll()
  }

  async getRoleConfig(role: RoleType): Promise<RoleConfigSummary> {
    const roleDescriptions: Record<RoleType, { name: string; desc: string }> = {
      ROOT: { name: 'Root SuperAdmin', desc: 'Full infrastructure, debug tooling & unconstrained platform control' },
      ADMIN: { name: 'Cohort Administrator', desc: 'Cohort management, moderation, user roles & track orchestration' },
      TEACHER: { name: 'Lead Instructor / Mentor', desc: 'Teaching studio, calendar, availability & lecture uploads' },
      STUDENT: { name: 'Cohort Fellow / Student', desc: 'Office hours booking, lecture vault streaming & subscription alerts' },
    }

    const features = await configRepository.getRoleFeatures(role)
    const meta = roleDescriptions[role] || { name: role, desc: '' }

    return {
      role,
      displayName: meta.name,
      description: meta.desc,
      features,
    }
  }

  async toggleFeatureForRole(key: string, role: RoleType, enabled: boolean): Promise<FeatureFlag | null> {
    logger.info(`Toggling feature "${key}" for role "${role}" to ${enabled ? 'ENABLED' : 'DISABLED'}`)
    return configRepository.setFeatureForRole(key, role, enabled)
  }

  async resetConfigurations(): Promise<FeatureFlag[]> {
    logger.info('Resetting all feature configurations to platform defaults')
    return configRepository.resetToDefaults()
  }
}

export const configService = new ConfigService()
