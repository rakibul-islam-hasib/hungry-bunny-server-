const express = require('express');
const router = express.Router();
const mongoMiddleware = require('./mongoClient');

router.use(mongoMiddleware);

router.get('/', async (req, res) => {
    const result = await req.mongo.communityPostCollection.find({}).sort({ posted: -1 }).toArray();
    res.send(result);
});

router.get('/comment/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const project = { projection: { comments: 1, _id: 0 } };
    const result = await req.mongo.communityPostCollection.findOne(filter, project);
    res.send(result.comments);
});

module.exports = router;