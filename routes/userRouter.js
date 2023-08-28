const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');


router.post('/', async (req, res) => {
    const data = req.body;
    const result = await req.mongo.usersCollection.insertOne(data);
    res.send(result);
});


router.get('/:email', verifyJWT, async (req, res) => {
    const email = req.params.email;
    const result = await req.mongo.usersCollection.findOne({ email: email });
    res.send(result);
});
router.get('/:email', verifyJWT, async (req, res) => {
    const email = req.params.email;
    const result = await req.mongo.usersCollection.findOne({ email: email }, { projection: { post: 1, _id: 0 } });
    res.send(result.post);
});
module.exports = router;