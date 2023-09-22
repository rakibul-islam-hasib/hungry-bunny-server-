const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cursor = req.mongo.faqCollection.find().limit(limit).skip(skip);
    const result = await cursor.toArray();
    res.send(result);
});


router.get('/total/count', async (req, res) => {
    try {
        const total = await req.mongo.faqCollection.estimatedDocumentCount();
        res.send({ total });
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = router;