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



router.get('/menu-Search/:text', async (req, res) => {
    const searchMenu = req.params.text;
    const result = await req.mongo.foodCollection.find({
        $or: [
            { food_name: { $regex: searchMenu, $options: "i" } },
            { category: { $regex: searchMenu, $options: "i" } },
            { restaurant_name: { $regex: searchMenu, $options: "i" } }
        ]
    }).toArray()
    res.send(result)
})




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

// Get pending food
router.get('/get/pending', async (req, res) => {
    const foodCollection = req.mongo.foodCollection;
    const result = await foodCollection.find({ status: 'pending' }).toArray();
    res.send(result);
});

// Convert the pending menu item restaurant_id to Object Id and aggrigate to food collection and get the pending menu with restaurant de

router.get('/get/pending/r', async (req, res) => {
    const foodCollection = req.mongo.foodCollection;
    const result = await foodCollection.aggregate([
        {
            $match: { status: 'pending' }
        },
        {
            $addFields: {
                restaurant_id: { $toObjectId: '$restaurant_id' } // Convert restaurant_id to ObjectId
            }
        },
        {
            $lookup: {
                from: 'applications',
                localField: 'restaurant_id',
                foreignField: '_id',
                as: 'restaurant'
            }
        }
    ]).toArray();

    res.send(result);
});

// Get all approved food
router.get('/get/approved', verifyJWT, async (req, res) => {
    const foodCollection = req.mongo.foodCollection;
    const result = await foodCollection.find({ approved: true }).toArray();
    res.send(result);
});

// Get a food  item via restaurant_id 
router.get('/get/:id', async (req, res) => {
    const foodCollection = req.mongo.foodCollection;
    const filter = { restaurant_id: req.params.id, status: 'approved' }
    const result = await foodCollection.find(filter).toArray();
    // console.log(result);
    res.send(result);
});


module.exports = router;