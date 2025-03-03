const express = require('express')
const router = express.Router()

const resumeRouter = require('./resume')

router.use('/resume', resumeRouter)

router.get('/test', (req, res) => {
  res.json({
    'msg': 'GET /api/test successful'
  })
})

module.exports = router