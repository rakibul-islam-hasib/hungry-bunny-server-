const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const { ObjectId } = require('mongodb');

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
router.put('/status/:id', verifyJWT, async (req, res) => {
    const applicationCollection = req.mongo.applicationCollection;
    const { status } = req.body;
    const filter = { _id: new ObjectId(req.params.id) }
    const docx = {
        $set: { status: status }
    }
    const result = await applicationCollection.updateOne(filter, docx);
    res.send(result);
});



module.exports = router;