import express from 'express'
import {
  authMiddleware,
  login,
  logout,
  refreshToken,
} from './auth.controller.js'

const router = express.Router()

router.get('/login', authMiddleware('basic'), login)
router.get('/logout', authMiddleware('at'), logout)
router.post('/refresh-token', authMiddleware('rt'), refreshToken)

export default router
