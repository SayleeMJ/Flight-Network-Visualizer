const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get all airports
router.get('/all', async (req, res) => {
  try {
    const airportsCollection = mongoose.connection.collection('airports');
    const airports = await airportsCollection.find({}).toArray();
    res.json(airports);
  } catch (error) {
    console.error('Error fetching airports:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get departure and arrival counts for each airport
router.get('/traffic', async (req, res) => {
  try {
    const flightsCollection = mongoose.connection.collection('flights');

    const traffic = await flightsCollection.aggregate([
      {
        $facet: {
          departures: [
            { $group: { _id: '$ORIGIN_AIRPORT', count: { $sum: 1 } } }
          ],
          arrivals: [
            { $group: { _id: '$DESTINATION_AIRPORT', count: { $sum: 1 } } }
          ]
        }
      }
    ]).toArray();

    res.json(traffic[0]);
  } catch (error) {
    console.error('Error fetching airport traffic:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
