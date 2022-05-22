import express from 'express'
import { authMiddleware } from '../auth/auth.controller'
import { jwtAuthMiddleware } from '../auth/auth.service'
import { getUser, putUser } from './users.controller'

const router = express.Router()

// TODO: authorization
router.get('/:email', getUser)
router.put('/:email', putUser)
export default router
