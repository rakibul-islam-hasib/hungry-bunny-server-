const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const cursor = restaurantCollection.find()
    const result = await cursor.toArray()
    res.send(result)
})

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    // console.log(id);
    const query = { _id: new ObjectId(id) }
    const result = await restaurantCollection.findOne(query);
    res.send(result)
})

module.exports = router;