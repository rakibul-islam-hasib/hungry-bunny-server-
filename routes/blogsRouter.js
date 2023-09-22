const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const cursor = req.mongo.blogsCollection.find().limit(limit).skip(skip);
    const result = await cursor.toArray();
    res.send(result);
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const query = { _id: new ObjectId(id) }
        const result = await req.mongo.blogsCollection.findOne(query);
        res.send(result)
    } catch (err) {
        res.status(400).send({ error: 'Invalid ID' });
    }
});

router.get('/total/count', async (req, res) => {
    try {
        const total = await req.mongo.blogsCollection.estimatedDocumentCount();
        res.send({ total });
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.post('/blogs', async(req, res) => {
    const newBlog = req.body;
    console.log(newBlog);
    const result = await req.mongo.blogsCollection.insertOne(newBlog)
    res.send(result)
})



module.exports = router;