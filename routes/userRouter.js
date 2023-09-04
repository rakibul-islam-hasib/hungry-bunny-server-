const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');


router.post('/', async (req, res) => {
    const data = req.body;
    const result = await req.mongo.usersCollection.insertOne(data);
    res.send(result);
});


router.get('/', async (req, res) => {
    const users = req.mongo.usersCollection.find()
    const result = await users.toArray()
    res.send(result)
})

router.patch('/admin/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const filter = { _id: new ObjectId(id) }
    const updateDoc = {
        $set: {
            role: 'admin'
        },
    };
    const result = await req.mongo.usersCollection.updateOne(filter, updateDoc);
    res.send(result)
})
router.patch('/restaurant/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const filter = { _id: new ObjectId(id) }
    const updateDoc = {
        $set: {
            role: 'restaurant'
        },
    };
    const result = await req.mongo.usersCollection.updateOne(filter, updateDoc);
    res.send(result)
})




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