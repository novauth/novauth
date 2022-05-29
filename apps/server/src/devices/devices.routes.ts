import express from 'express'
import { authMiddleware } from '../auth/auth.controller.js'
import { jwtAuthMiddleware } from '../auth/auth.service.js'
import {
  postDevice,
  putDevice,
  pushNotificationToDevice,
} from './devices.controller.js'

const router = express.Router()

// TODO: authorization
router.put('/:deviceId', putDevice)
router.post('/:deviceId/push', pushNotificationToDevice)
router.post('/', postDevice)
export default router
