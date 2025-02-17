const express = require('express')
const path = require('path')
// const mongoose = require('mongoose')
const { mongooseConnection } = require('./db/connection')
require('dotenv').config()

// express
const PORT = process.env.PORT || 3000
const app = express()

// global middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// routes
const router = require('./routes')
app.use('/', router)

// vite-react in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'vite-react', 'dist')))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'vite-react', 'dist', 'index.html'))
  })
}

// db
mongooseConnection.once('open', () => {
  console.log(`Mongoose connection open`)
  app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`)
  })
})
