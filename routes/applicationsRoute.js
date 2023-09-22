const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const { ObjectId } = require('mongodb');
const verifyAdmin = require('../middleware/verifyAdmin');

router.post('/apply', verifyJWT, async (req, res) => {
    const data = req.body;
    const applicationCollection = req.mongo.applicationCollection;
    const result = await applicationCollection.insertOne(data);
    res.send(result);
});


router.get('/get', verifyJWT,  async (req, res) => {
    const applicationCollection = req.mongo.applicationCollection;
    const result = await applicationCollection.find().toArray();
    res.send(result);
});


router.put('/status/:id', verifyJWT, async (req, res) => {
    const applicationCollection = req.mongo.applicationCollection;
    
    const userCollection = req.mongo.usersCollection;
    const filter = { _id: new ObjectId(req.params.id) }
    const userId = await applicationCollection.findOne(filter, { projection: { userId: 1, _id: 1 } });
    console.log(userId)

    const { status, userRole } = req.body;
    const userFilter = { _id: new ObjectId(userId.userId) }
    const docx = {
        $set: { status: status }
    }
    const userDocx = {
        $set: { role: userRole }
    }
    const userResult = await userCollection.updateOne(userFilter, userDocx);
    const result = await applicationCollection.updateOne(filter, docx);
    res.send({ result, userResult });
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

// application get route
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const cursor = req.mongo.applicationCollection.find().limit(limit).skip(skip);
    const result = await cursor.toArray();
    res.send(result);
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const query = { _id: new ObjectId(id) }
        const result = await req.mongo.applicationCollection.findOne(query);
        res.send(result)
    } catch (err) {
        res.status(400).send({ error: 'Invalid ID' });
    }
});

router.get('/total/count', async (req, res) => {
    try {
        const total = await req.mongo.applicationCollection.estimatedDocumentCount();
        res.send({ total });
    } catch (err) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// get specific data
router.get('/restaurant-food', async(req, res) =>{
    let query = {};
    if(req.query?.restaurant_name){
        query = { restaurant_name : req.mongo.query.restaurant_name}
    }
    const result = await req.mongo.foodCollection.find(query).toArray();
    res.send(result)
})



module.exports = router;