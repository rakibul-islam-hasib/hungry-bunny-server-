const express = require('express');
const verifyJWT = require('../middleware/verifyJWT');
const router = express.Router();

router.post('/post/new', async (req, res) => {
    const data = req.body;
    const foodCollection = req.mongo.foodCollection;
    const result = await foodCollection.insertOne(data);
    res.send(result);
});




router.get('/', async (req, res) => {
    // const email = req.query.email
    // console.log(email);
    // const query = { email: email }
    const result = await req.mongo.foodCollection.find().toArray()
    res.send(result)
})


// router.get('/menu-search/:text', async (req, res) => {
//     const searchMenu = req.params.text;
//     const result = await req.mongo.foodCollection.find({
//         $or: [
//             { food_name: { $regex: searchMenu, $options: "i" } },
//             { category: { $regex: searchMenu, $options: "i" } },
//             { restaurant_name: { $regex: searchMenu, $options: "i" } }
//         ]
//     }).toArray()
//     res.send(result)
// })





router.get('/get/all', async (req, res) => {
    const foodCollection = req.mongo.foodCollection;
    const result = await foodCollection.find({ status: 'approved' }).toArray();
    res.send(result);
});

// Get all approved food
router.get('/get/approved', verifyJWT, async (req, res) => {
    const foodCollection = req.mongo.foodCollection;
    const result = await foodCollection.find({ approved: true }).toArray();
    res.send(result);
});


module.exports = router;