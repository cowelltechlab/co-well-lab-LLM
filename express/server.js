const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const PORT = process.env.PORT || 3001

const mongoConnection = require('./db/connection');

const app = express()

app.get('/api/test-db', async (req, res) => {
  try {
    const collections = await require('./db/connection').connection.db.listCollections().toArray();
    res.json({
      message: 'MongoDB connection successful!',
      collections,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error accessing MongoDB', details: error.message });
  }
});

mongoose.connect(mongoConnection)
  .then(() => {
    console.log(`MongoDB service connected`);
    app.listen(PORT, () => {
      console.log(`Express server listening on port ${PORT}`)
    })

  })
