const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {

});

router.post('/post/new', async (req, res) => {
    const data = req.body;
    const foodCollection = req.mongo.foodCollection;
    const result = await foodCollection.insertOne(data);
    res.send(result);
});

module.exports = router;