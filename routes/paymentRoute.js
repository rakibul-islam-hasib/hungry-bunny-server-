const express = require('express');
const verifyJWT = require('../middleware/verifyJWT');
const { ObjectId } = require('mongodb');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
router.post('/create-payment-intent', verifyJWT, async (req, res) => {
    const { price } = req.body;
    if (!price || price === 0 || price == null) {
        return res.json({ error: 'Missing price in request body' });
    }
    const amount = parseInt(price) * 100;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
    });
    res.send({
        clientSecret: paymentIntent.client_secret
    });
})
// Post payment info to database
router.post('/post-payment-info', async (req, res) => {
    const paymentCollection = req.mongo.paymentCollection;
    const userCollection = req.mongo.usersCollection;
    const paymentInfo = req.body;
    const userId = paymentInfo.userId;
    const orderedItem = paymentInfo.orderedItem;

    // Now update credit to the food item 
    const foodCollection = req.mongo.foodCollection;

    if (!paymentInfo) {
        return res.json({ error: 'Missing payment info in request body' });
    }

    try {
        // Decrease the quantity of food items by the quantity ordered
        for (const item of orderedItem) {
            const foodId = new ObjectId(item.foodId);
            const quantity = item.quantity;

            // Find the food item
            const foodItem = await foodCollection.findOne({ _id: foodId });

            if (!foodItem) {
                return res.json({ error: `Food item with ID ${item.foodId} not found` });
            }

            // Check if there is enough quantity to fulfill the order
            if (foodItem.quantity < quantity) {
                return res.json({ error: `Insufficient quantity for food item with ID ${item.foodId}` });
            }

            // Update the quantity of the food item
            await foodCollection.updateOne(
                { _id: foodId },
                { $inc: { quantity: -quantity } }
            );
        }

        // Add credit to user
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.json({ error: 'User not found' });
        }

        // Calculate the new credit
        const newCredit = user.credit ? user.credit + paymentInfo.totalItems : paymentInfo.totalItems;

        // Update the user's credit
        await userCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { credit: newCredit } }
        );

        const result = await paymentCollection.insertOne(paymentInfo);
        res.send({ result, credit: newCredit });
    } catch (err) {
        console.log(err);
        res.send({ error: err });
    }
})


// Delete cart items from database
router.delete('/delete-cart-items', async (req, res) => {
    const { cartItems } = req.body;
    const cartItemObj = cartItems.map(item => new ObjectId(item));
    const cartCollection = req.mongo.cartCollection;
    if (!cartItems) {
        return res.json({ error: 'Missing cart items in request body' });
    }
    try {
        const result = await cartCollection.deleteMany({ _id: { $in: cartItemObj } });
        res.send(result);
    } catch (err) {
        console.log(err);
        res.send({ error: err });
    }
})



module.exports = router;