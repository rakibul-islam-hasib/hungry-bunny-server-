const express = require('express');
const verifyJWT = require('../middleware/verifyJWT');
const router = express.Router();

router.post('/post/new', async (req, res) => {
    const data = req.body;
    const foodCollection = req.mongo.foodCollection;
    const result = await foodCollection.insertOne(data);
    res.send(result);
});




router.get('/:email', async (req, res) => {
    const email = req.params.email
    console.log(email);
    const query = { email: email }
    const result = await req.mongo.foodCollection.find(query).toArray()
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




router.get('/allMenu/:text', async (req, res) => {
    console.log(req.params.text);
    if (req.params.text == 'Pizza' || req.params.text == 'Biryani' || req.params.text == 'Burger' || req.params.text == 'Snacks' || req.params.text == 'Sushi') {

        const foodCollection = req.mongo.foodCollection;
        const result = await foodCollection.find( { category: req.params.text }).toArray();
        return res.send(result);
    }
    const result = await req.mongo.foodCollection.find({ status: 'approved' }).toArray();
    res.send(result);
});

// Get all approved food
router.get('/get/approved', verifyJWT, async (req, res) => {
    const foodCollection = req.mongo.foodCollection;
    const result = await foodCollection.find({ approved: true }).toArray();
    res.send(result);
});


module.exports = router;