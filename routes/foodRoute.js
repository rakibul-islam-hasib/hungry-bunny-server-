const express = require('express');
const router = express.Router();







router.get('/', async (req, res) =>{

    const result = await req.mongo.foodCollection.find({status: "approved"}).toArray()
    res.send(result)
})




router.post('/post/new', async (req, res) => {
    const data = req.body;
    const foodCollection = req.mongo.foodCollection;
    const result = await foodCollection.insertOne(data);
    res.send(result);
});

module.exports = router;