const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const PORT = process.env.PORT || 3000

const mongooseConnection = require('./db/connection');

const app = express()

app.get('/api/test-db', async (req, res) => {
  // Check if the native connection is ready
  if (!mongoose.connection.db) {
    return res.status(500).json({ error: 'MongoDB connection not ready' });
  }
  
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({
      message: 'MongoDB connection successful!',
      collections,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error accessing MongoDB', details: error.message });
  }
});

mongooseConnection.once('open', () => {
  console.log(`Mongoose connection open`);
  app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`)
  })

})
