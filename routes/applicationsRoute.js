const express = require('express');
const router = express.Router();

router.post('/apply', async (req, res) => {
    const data = req.body;
    const applicationCollection = req.mongo.applicationCollection;
    const result = await applicationCollection.insertOne(data);
    res.send(result);
});

module.exports = router;