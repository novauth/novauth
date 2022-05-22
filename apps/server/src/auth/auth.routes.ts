import express from 'express'
import { basicAuthMiddleware, jwtAuthMiddleware, jwtRefreshMiddleware } from './auth.service'
import { login, logout, refreshToken } from './auth.controller'

const router = express.Router()

router.get('/login', basicAuthMiddleware, login)
router.get('/logout', jwtAuthMiddleware, logout)
router.post('/refresh-token', jwtRefreshMiddleware, refreshToken)

export default router
