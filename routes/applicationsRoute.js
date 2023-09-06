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
    const userCollection = req.mongo.usersCollection;
    const filter = { _id: new ObjectId(req.params.id) }
    const userId = await applicationCollection.findOne(filter, { projection: { userId: 1, _id: 0 } });
    const { status, userRole } = req.body;
    const userFilter = { _id: new ObjectId(userId.userId) }
    const docx = {
        $set: { status: status }
    }
    const userDocx = {
        $set: { role: userRole }
    }
    // console.log(userId);
    // now find the user and update the role
    const userResult = await userCollection.updateOne(userFilter, userDocx);
    const result = await applicationCollection.updateOne(filter, docx);
    res.send({ result, userResult });
});



module.exports = router;