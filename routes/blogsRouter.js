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
    // console.log(newBlog);
    const result = await req.mongo.blogsCollection.insertOne(newBlog)
    res.send(result)
})

router.put('/blogs/:id', async(req, res) =>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = {upsert: true}
    const updateBlog = req.body;
    const Blog = {
        $set: {
            blogHeading: updateBlog.blogHeading,
            authorName: updateBlog.authorName,
            authorImage: updateBlog.authorImage,
            blogImage: updateBlog.blogImage,
            date: updateBlog.date,
            email: updateBlog.email,
            time: updateBlog.time,
            rating: updateBlog.rating,
            description: updateBlog.description,
        }
    }
    const result = await req.mongo.blogHeading.updateOne( filter, Blog, options)
    res.send(result)
})


router.delete('/blogs/:id', async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id)}
    const result = await req.mongo.blogsCollection.deleteOne(query)
    res.send(result)
})

module.exports = router;