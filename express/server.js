const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

// express
const PORT = process.env.PORT || 3000
const app = express()

// routes
const router = require('./routes')
app.use('/', router)

// db
const mongooseConnection = require('./db/connection')

mongooseConnection.once('open', () => {
  console.log(`Mongoose connection open`)
  app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`)
  })
})
