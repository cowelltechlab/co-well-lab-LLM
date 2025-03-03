const express = require('express')
const router = express.Router()

const upload = require('../../../middleware/uploadMiddleware')
const { uploadFile, getFile } = require('../../../controllers/resumeController')

router.post('/', upload.single('pdf'), uploadFile)

router.get('/:filename', getFile)

module.exports = router