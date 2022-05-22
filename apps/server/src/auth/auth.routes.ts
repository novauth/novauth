import express from 'express'
import { basicAuthMiddleware, jwtAuthMiddleware, jwtRefreshMiddleware } from './auth.service.js'
import { login, logout, refreshToken } from './auth.controller.js'

const router = express.Router()

router.get('/login', basicAuthMiddleware, login)
router.get('/logout', jwtAuthMiddleware, logout)
router.post('/refresh-token', jwtRefreshMiddleware, refreshToken)

export default router
