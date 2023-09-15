const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();



router.post('/new', async (req, res) => {
    const data = req.body;
    const cartCollection = req.mongo.cartCollection;
    const result = await cartCollection.insertOne(data);
    res.send(result);
});
// InCart data : {foodId, userId, quantity} || Now aggregate to get food details and det food details , restaurant details , user details
router.get('/in-cart/:userId', async (req, res) => {
    const userId = req.params.userId;
    const cartCollection = req.mongo.cartCollection;
    const pipeline = [
        {
            $match: {
                userId: new ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: 'food',
                localField: 'itemId',
                foreignField: '_id',
                as: 'foodDetails'
            }
        },
        {
            $lookup: {
                from: 'applications',
                localField: 'restaurant_id',
                foreignField: '_id',
                as: 'restaurantDetails'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $project: {
                'foodDetails.food_name': 1,
                'foodDetails.category': 1,
                'foodDetails.image': 1,
                'foodDetails.price': 1,
                'foodDetails._id': 1,
                'restaurantDetails.restaurant_name': 1,
                'restaurantDetails._id': 1,
                'userDetails.name': 1,
                'userDetails.email': 1,
                quantity: 1
            }
        }
    ]
    const result = await cartCollection.aggregate(pipeline).toArray();
    res.send(result);
});


router.get('/', async (req, res) => {

    const result = await req.mongo.cartCollection.find().toArray()
    res.send(result)
})








module.exports = router;