const express = require('express');
const { ObjectId } = require('mongodb');
const verifyJWT = require('../middleware/verifyJWT');
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

router.delete('/delete/:cartId', verifyJWT, async (req, res) => {
    const cartId = req.params.cartId;
    const cartCollection = req.mongo.cartCollection;
    const result = await cartCollection.deleteOne({ _id: new ObjectId(cartId) });
    res.send(result);
});

// Delete cart item by cartIds array
router.delete('/delete', verifyJWT, async (req, res) => {
    const cartIds = req.body.cartIds || [];
    // console.log(req.body.cartIds)
    const cartCollection = req.mongo.cartCollection;
    const result = await cartCollection.deleteMany({ _id: { $in: cartIds.map(id => new ObjectId(id)) } });
    res.send(result);
});

router.put('/update/:cartId', verifyJWT, async (req, res) => {
    const cartId = req.params.cartId;
    const quantity = req.body.quantity;
    const cartCollection = req.mongo.cartCollection;
    const cartItem = await cartCollection.findOne(
        { _id: new ObjectId(cartId) },
        { projection: { itemId: 1, userId: 1, restaurant_id: 1, _id: 0 } }
    );
    if (quantity === 'plus') {
        const result = await cartCollection.insertOne(cartItem);
        res.send(result);
    }
    else {
        const result = await cartCollection.deleteOne({ _id: new ObjectId(cartId) });
        res.send(result);
    }
});




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
            $unwind: '$userDetails'
        },
        {
            $group: {
                _id: '$foodDetails._id',
                foodDetails: { $first: '$foodDetails' },
                restaurantDetails: { $first: '$restaurantDetails' },
                userDetails: { $first: '$userDetails' },
                quantity: { $sum: 1 },
                cartIds: { $addToSet: '$_id' }
            }
        },
        {
            $project: {
                _id: 1,
                'foodDetails.food_name': 1,
                'foodDetails.category': 1,
                'foodDetails.image': 1,
                'foodDetails.price': 1,
                'foodDetails._id': 1,
                'foodDetails.restaurant_id': 1,
                'restaurantDetails.restaurant_name': 1,
                'restaurantDetails._id': 1,
                'userDetails.name': 1,
                'userDetails.email': 1,
                quantity: 1,
                cartIds: 1
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