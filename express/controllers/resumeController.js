const path = require('path')
const fs = require('fs')

const uploadFile = (req, res) => {
  console.log(req.file)
  res.json(req.file)
}

const getFile = (req, res) => {
  const { filename } = req.params

  if (!filename.match(/^[a-zA-Z0-9-_]+\.(pdf)$/)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  const filePath = path.join(__dirname, '..', 'uploads', filename)

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found'})
    }

    res.sendFile(filePath)
  })
}

module.exports = {
  uploadFile,
  getFile
}