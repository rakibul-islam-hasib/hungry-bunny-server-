const express = require('express');
const router = express.Router();



router.post('/cart/new', async (req, res) => {
    const data = req.body;
    const cartCollection = req.mongo.foodCartCollection;
    const result = await cartCollection.insertOne(data);
    res.send(result);
});


router.get('/', async (req, res) => {
    const result = await req.mongo.foodCartCollection.find().toArray()
    res.send(result)
})


module.exports = router;