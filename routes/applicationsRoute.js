const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');

router.post('/apply', verifyJWT, async (req, res) => {
    const data = req.body;
    const applicationCollection = req.mongo.applicationCollection;
    const result = await applicationCollection.insertOne(data);
    res.send(result);
});
router.get('/get', verifyJWT, async (req, res) => {
    const applicationCollection = req.mongo.applicationCollection;
    const result = await applicationCollection.find({}).toArray();
    res.send(result);
});




module.exports = router;