const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();


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

router.get('/search', async(req, res) =>{
    const searchQuery = req.query.query;
    try{
        const query = {
            $or: [
                { restaurantName: {$regex: searchQuery, $options: 'i' } },
                { place: {$regex: searchQuery, $options: 'i' }}
            ]
        };
        const result = await req.mongo.restaurantCollection.find(query).toArray()
        res.send(result)
    } catch (err) {
        res.status(400).send({ error: 'Invalid ID' });
    }
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

router.get('/total/count', async (req, res) => {
    try {
        const total = await req.mongo.restaurantCollection.estimatedDocumentCount();
        res.send({ total });
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = router;