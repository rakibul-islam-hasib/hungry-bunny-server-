const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();



router.post('/new', async (req, res) => {
    const data = req.body;
    const objIdData = {
        itemId: new ObjectId(data.itemId),
        userId: new ObjectId(data.userId),
        restaurant_id: new ObjectId(data.restaurant_id)
    }
    const cartCollection = req.mongo.cartCollection;
    const result = await cartCollection.insertOne(objIdData);
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
            $unwind: '$foodDetails' 
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
            $unwind: '$restaurantDetails' 
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
            $unwind: '$userDetails' // Unwind the userDetails array (if there are multiple matches)
        },
        {
            $group: {
                _id: '$foodDetails._id', // Group by foodDetails._id
                foodDetails: { $first: '$foodDetails' }, // Take the foodDetails from the first document in the group
                restaurantDetails: { $first: '$restaurantDetails' }, // Take the restaurantDetails from the first document in the group
                userDetails: { $first: '$userDetails' }, // Take the userDetails from the first document in the group
                quantity: { $sum: 1 } // Count the number of documents with the same itemId
            }
        },
        {
            $project: {
                _id: 0, // Exclude the _id field
                'foodDetails.food_name': 1,
                'foodDetails.category': 1,
                'foodDetails.image': 1,
                'foodDetails.price': 1,
                'foodDetails._id': 1,
                'restaurantDetails.restaurant_name': 1,
                'userDetails.name': 1,
                'userDetails.email': 1,
                quantity: 1 // Include the quantity field with the count
            }
        }
    ];

    try {
        const result = await cartCollection.aggregate(pipeline).toArray();
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/', async (req, res) => {

    const result = await req.mongo.cartCollection.find().toArray()
    res.send(result)
})








module.exports = router;