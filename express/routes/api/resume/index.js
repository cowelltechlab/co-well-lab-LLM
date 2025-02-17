const express = require('express')
const router = express.Router()

router.post('/', (req, res) => {
  res.json({
    'msg': 'POST /api/resume received'
  })
})

module.exports = router