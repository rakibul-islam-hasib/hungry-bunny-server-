const express = require('express');
const verifyJWT = require('../middleware/verifyJWT');
const router = express.Router();







router.get('/', async (req, res) => {

    const result = await req.mongo.foodCollection.find({ status: "approved" }).toArray()
    res.send(result)
})

router.get('/:email', async (req, res) => {

    const email = req.query.email;
    const query = { email: email };
    const result = await req.mongo.foodCollection.find(query).toArray()
    res.send(result)
});


router.post('/post/new', async (req, res) => {
    const data = req.body;
    const foodCollection = req.mongo.foodCollection;
    const result = await foodCollection.insertOne(data);
    res.send(result);
});

module.exports = router;