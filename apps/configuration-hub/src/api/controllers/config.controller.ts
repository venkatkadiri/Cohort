import { Request, Response } from 'express'
import { configService } from '../../services/config.service.js'
import { RoleType } from '../../database/models/config.model.js'
import { paginateWithCursor } from '../../utils/pagination.js'

export async function listFeaturesController(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '20', 10), 1), 100)
    const cursor = (req.query.cursor as string) || null

    const flags = await configService.getAllFeatureFlags()
    const paginated = paginateWithCursor(flags, limit, cursor)

    res.json({
      version: 'v1',
      success: true,
      flags: paginated.items,
      pageInfo: paginated.pageInfo,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export async function getRoleConfigController(req: Request, res: Response): Promise<void> {
  try {
    const role = (req.params.role?.toUpperCase() || 'STUDENT') as RoleType
    const config = await configService.getRoleConfig(role)
    res.json({
      version: 'v1',
      success: true,
      config,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export async function toggleFeatureController(req: Request, res: Response): Promise<void> {
  try {
    const { key, role, enabled } = req.body
    if (!key || !role) {
      res.status(400).json({ error: 'Missing key or role' })
      return
    }

    const updated = await configService.toggleFeatureForRole(key, role as RoleType, !!enabled)
    if (!updated) {
      res.status(404).json({ error: `Feature ${key} not found` })
      return
    }

    res.json({
      version: 'v1',
      success: true,
      flag: updated,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export async function resetConfigController(_req: Request, res: Response): Promise<void> {
  try {
    const flags = await configService.resetConfigurations()
    res.json({
      version: 'v1',
      success: true,
      message: 'Reset to defaults successful',
      flags,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
