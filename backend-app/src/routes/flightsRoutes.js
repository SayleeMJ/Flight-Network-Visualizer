const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get all flights (existing endpoint)
router.get('/all', async (req, res) => {
  try {
    const flightsCollection = mongoose.connection.collection('flights');

    const flights = await flightsCollection.find({}).toArray();

    res.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get routes for a selected airline
router.get('/routes/:code', async (req, res) => {
  try {
    const flightsCollection = mongoose.connection.collection('flights');

    const airlineCode = req.params.code;

    const routes = await flightsCollection.find(
      { AIRLINE: airlineCode },
      {
        projection: {
          _id: 0,
          AIRLINE: 1,
          ORIGIN_AIRPORT: 1,
          DESTINATION_AIRPORT: 1
        }
      }
    ).toArray();

    res.json(routes);
  } catch (error) {
    console.error('Error fetching airline routes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
