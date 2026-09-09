import { Router } from 'express'
import {
  listFeaturesController,
  getRoleConfigController,
  toggleFeatureController,
  resetConfigController,
} from '../controllers/config.controller.js'

const router: Router = Router()

router.get('/features', listFeaturesController)
router.get('/role/:role', getRoleConfigController)
router.post('/toggle', toggleFeatureController)
router.post('/reset', resetConfigController)

export default router
