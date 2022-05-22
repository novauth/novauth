import express from 'express'
import { authMiddleware } from '../auth/auth.controller'
import { jwtAuthMiddleware } from '../auth/auth.service'
import { postDevice, putDevice } from './devices.service'

const router = express.Router()

// TODO: authorization
router.put('/:deviceId', putDevice)
router.post('/', postDevice)
export default router