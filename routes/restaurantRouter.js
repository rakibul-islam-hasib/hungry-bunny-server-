const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

router.get('/', async (req, res) => {
    const cursor = req.mongo.restaurantCollection.find()
    const result = await cursor.toArray()
    res.send(result)
})
router.get('/total/count', async (req, res) => {
    const cursor = req.mongo.restaurantCollection.estimatedDocumentCount()
    const result = await cursor;
    res.send({ total: result })
})
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    // console.log(id);
    const query = { _id: new ObjectId(id) }
    const result = await req.mongo.restaurantCollection.findOne(query);
    res.send(result)
})
// Search by name
router.get('/search/query', async (req, res) => {
    // const name = req..name;
    const name = req.query.name;
    console.log(name)
    const query = { restaurantName: { $regex: name, $options: 'i' } }
    const cursor = req.mongo.restaurantCollection.find(query)
    const result = await cursor.toArray()
    res.send(result)
})

module.exports = router;