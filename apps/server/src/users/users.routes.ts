import express from 'express'
import { authMiddleware } from '../auth/auth.controller.js'
import { checkRequestingUser, getUser, putUser } from './users.controller.js'

const router = express.Router()

router.get('/:email', authMiddleware('at'), checkRequestingUser, getUser)
router.put('/:email', putUser)
export default router
