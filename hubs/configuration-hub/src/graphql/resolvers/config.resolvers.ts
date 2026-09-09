import { configService } from '../../services/config.service.js'
import { RoleType } from '../../database/models/config.model.js'

export const configResolvers = {
  Query: {
    featureFlags: async () => {
      return configService.getAllFeatureFlags()
    },
    roleConfig: async (_: unknown, { role }: { role: RoleType }) => {
      const res = await configService.getRoleConfig(role)
      return {
        role: res.role,
        displayName: res.displayName,
        description: res.description,
        features: Object.entries(res.features).map(([key, enabled]) => ({
          key,
          enabled,
        })),
      }
    },
    configHealth: () => 'Configuration Hub service is operational',
  },
  Mutation: {
    toggleFeature: async (_: unknown, { input }: { input: { key: string; role: RoleType; enabled: boolean } }) => {
      return configService.toggleFeatureForRole(input.key, input.role, input.enabled)
    },
    resetFeatureFlags: async () => {
      return configService.resetConfigurations()
    },
  },
}
