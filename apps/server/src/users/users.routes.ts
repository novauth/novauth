import express from 'express'
import { authMiddleware } from '../auth/auth.controller.js'
import { jwtAuthMiddleware } from '../auth/auth.service.js'
import { getUser, putUser } from './users.controller.js'

const router = express.Router()

// TODO: authorization
router.get('/:email', getUser)
router.put('/:email', putUser)
export default router
