const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

router.get('/payment', async (req, res) => {
    const paymentCollection = req.mongo.paymentCollection;
    try {
        const result = await paymentCollection.find({}).toArray();
        res.send(result);
    } catch (err) {
        console.log(err);
        res.send({ error: err });
    }
})

//! Main Work here 
router.get('/order/:restaurantId', async (req, res) => {
    const paymentCollection = req.mongo.paymentCollection;
    const restaurantId = req.params.restaurantId;
    const foodCollection = req.mongo.foodCollection;
    const applicationCollection = req.mongo.applicationCollection;
    try {

        const restaurant = await applicationCollection.findOne(
            { _id: new ObjectId(restaurantId) },
            { projection: { orders: 1 } }
        );
        if (!restaurant) {
            return res.json({ error: `Restaurant with ID ${restaurantId} not found` });
        }


        const pipeline = [
            {
                $match: {
                    _id: new ObjectId(restaurantId)
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field if you don't need it
                    orders: 1, // Include the 'orders' field and exclude all other fields
                    quantity: 1
                }
            },
            {
                $unwind: '$orders'
            },
            {
                $lookup: {
                    from: 'food',
                    localField: 'orders.orderedItem.foodId',
                    foreignField: '_id',
                    as: 'food'
                }
            },
        ]

        const result = await applicationCollection.aggregate(pipeline).toArray();
        res.send(result);

    }
    catch (err) {
        console.log(err);
        res.send({ error: err });
    }
})

// Update the status of the order (orders.deliveryStatus)
router.patch('/order/:restaurantId/:paymentId', async (req, res) => {
    const restaurantId = req.params.restaurantId;
    const paymentId = req.params.paymentId;
    const applicationCollection = req.mongo.applicationCollection;
    const deliveryStatus = 'delivered' //req.body.deliveryStatus;
    try {
        const result = await applicationCollection.updateOne(
            { _id: new ObjectId(restaurantId), 'orders.paymentId': paymentId },
            { $set: { 'orders.$.deliveryStatus': deliveryStatus } }
        );
        res.send(result);
    } catch (err) {
        console.log(err);
        res.send({ error: err });
    }
})



module.exports = router;