const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');


router.post('/', async (req, res) => {
    const data = req.body;
    const result = await req.mongo.usersCollection.insertOne(data);
    res.send(result);
});

router.get('/', async (req, res) =>{
    const users= req.mongo.usersCollection.find()
    const result = await users.toArray()
    res.send(result)
})

router.get('/:email', verifyJWT, async (req, res) => {
    const email = req.params.email;
    const regex = new RegExp(email, 'i'); // i for case insensitive
    const result = await req.mongo.usersCollection.findOne({ email: regex });
    res.send(result);
});
router.get('/post/:email', verifyJWT, async (req, res) => {
    const email = req.params.email;
    const result = await req.mongo.usersCollection.findOne({ email: email }, { projection: { post: 1, _id: 0 } });
    res.send(result.post);
});
module.exports = router;