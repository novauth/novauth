import express from 'express'
const router = express.Router()

/* GET home page. */
router.get('/', function (req: express.Request, res: express.Response, next: express.NextFunction) {
  res
    .status(200)
    .json({ name: 'NovAuth API', version: '0.0.0' })
})

export default router
