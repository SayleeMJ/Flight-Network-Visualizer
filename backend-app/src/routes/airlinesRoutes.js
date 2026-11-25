const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get all airlines
router.get('/all', async (req, res) => {
  try {
    const airlineCollection = mongoose.connection.collection('airlines');
    const airlines = await airlineCollection.find({}).toArray();
    res.json(airlines);
  } catch (error) {
    console.error('Error fetching airlines:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get flight counts and total delays for all airlines
router.get('/summary', async (req, res) => {
  try {
    const flightsCollection = mongoose.connection.collection('flights');

    const summary = await flightsCollection.aggregate([
      {
        $group: {
          _id: '$AIRLINE',
          count: { $sum: 1 },
          DEPARTURE_DELAY: {
            $sum: { $ifNull: ['$DEPARTURE_DELAY', 0] }
          },
          ARRIVAL_DELAY: {
            $sum: { $ifNull: ['$ARRIVAL_DELAY', 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          AIRLINE: '$_id',
          count: 1,
          DEPARTURE_DELAY: 1,
          ARRIVAL_DELAY: 1
        }
      }
    ]).toArray();

    res.json(summary);
  } catch (error) {
    console.error('Error fetching airline summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get delay history for one airline
router.get('/history/:code', async (req, res) => {
  try {
    const flightsCollection = mongoose.connection.collection('flights');
    const airlineCode = req.params.code;

    const history = await flightsCollection.find(
      {
        AIRLINE: airlineCode,
        DEPARTURE_DELAY: { $type: 'number' },
        ARRIVAL_DELAY: { $type: 'number' }
      },
      {
        projection: {
          _id: 0,
          AIRLINE: 1,
          DEPARTURE_DELAY: 1,
          ARRIVAL_DELAY: 1
        }
      }
    ).toArray();

    res.json(history);
  } catch (error) {
    console.error('Error fetching airline history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
