const express = require('express');
const router = express.Router();
const connect = require('./mongoClient');

router.get('/', async (req, res) => {
  const client = await connect();
  const database = client.db('hungry_bunny');
  const communityPostCollection = database.collection('community_post');
  const result = await communityPostCollection.find({}).sort({ posted: -1 }).toArray();
  res.send(result);
});

module.exports = router;