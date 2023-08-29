const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// router.get('/', async (req, res) => {
//     const cursor = req.mongo.restaurantCollection.find()
//     const result = await cursor.toArray()
//     res.send(result)
// })

// router.get('/:id', async (req, res) => {
//     const id = req.params.id;
//     // console.log(id);
//     const query = { _id: new ObjectId(id) }
//     const result = await req.mongo.restaurantCollection.findOne(query);
//     res.send(result)
// })

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    const cursor = req.mongo.restaurantCollection.find().limit(limit).skip(skip);
    const result = await cursor.toArray();
    res.send(result);
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const query = { _id: new ObjectId(id) }
        const result = await req.mongo.restaurantCollection.findOne(query);
        res.send(result)
    } catch (err) {
        res.status(400).send({ error: 'Invalid ID' });
    }
});

router.get('/total/count', async (req, res) => {
    try {
        const total = await req.mongo.restaurantCollection.estimatedDocumentCount();
        res.send({ total });
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = router;