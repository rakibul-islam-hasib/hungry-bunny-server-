const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const { ObjectId } = require('mongodb');
const verifyAdmin = require('../middleware/verifyAdmin');
const mail = require('../middleware/sendMail');

router.post('/apply', verifyJWT, async (req, res) => {
    const data = req.body;
    const applicationCollection = req.mongo.applicationCollection;
    const result = await applicationCollection.insertOne(data);
    res.send(result);
});


router.get('/get', verifyJWT, async (req, res) => {
    const applicationCollection = req.mongo.applicationCollection;
    const result = await applicationCollection.find().toArray();
    res.send(result);
});


router.put('/status/:id', verifyJWT, async (req, res) => {
    const applicationCollection = req.mongo.applicationCollection;

    const userCollection = req.mongo.usersCollection;
    const filter = { _id: new ObjectId(req.params.id) }
    const userId = await applicationCollection.findOne(filter, { projection: { userId: 1, _id: 1 } });


    const { status, userRole } = req.body;
    const userFilter = { _id: new ObjectId(userId.userId) }
    const docx = {
        $set: { status: status }
    }
    const userDocx = {
        $set: { role: userRole }
    }
    const userResult = await userCollection.updateOne(userFilter, userDocx);
    // get the user email and send email to the user
    const userEmail = await userCollection.findOne(userFilter, { projection: { email: 1, _id: 0 } });
    const result = await applicationCollection.updateOne(filter, docx);
    // if (result.matchedCount === 0) return res.send({ error: 'Application not found' });
    if (userEmail.email) {
        await mail('Approved', userEmail.email);
    };

    res.send({ result, userResult: userEmail });
});


router.get('/get/:id', async (req, res) => {
    const applicationCollection = req.mongo.applicationCollection;
    const filter = { userId: req.params.id }
    const result = await applicationCollection.findOne(filter);
    const error = { error: true, result: 'Application not approved yet' }
    if (result?.status !== 'approved') return res.send(error);
    else return res.send(result);
});

router.get('/get/approved', verifyJWT, async (req, res) => {
    const applicationCollection = req.mongo.applicationCollection;
    const filter = { status: 'approved' }
    const result = await applicationCollection.find(filter).toArray();
    res.send(result);
});

router.get('/get/pending', verifyJWT, async (req, res) => {
    const applicationCollection = req.mongo.applicationCollection;
    const filter = { status: 'pending' }
    const result = await applicationCollection.find(filter).toArray();
    res.send(result);
});

// Get specific restaurant by id 
router.get('/get/:id', async (req, res) => {
    const applicationCollection = req.mongo.applicationCollection;
    const filter = { _id: new ObjectId(req.params.id) }
    const result = await applicationCollection.findOne(filter);
    res.send(result);
});


module.exports = router;