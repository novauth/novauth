import express from 'express'
import { authMiddleware } from '../auth/auth.controller'
import { jwtAuthMiddleware } from '../auth/auth.service'
import {
  getUser,
  putUser,
} from './users.controller'

const router = express.Router()

/* GET users listing. */
router.get('/:username', jwtAuthMiddleware, getUser)
router.put(
  '/:username',
  authMiddleware(
    'at',
    (req) =>
      req.body.action === 'create'
  ),
  putUser
)
export default router
