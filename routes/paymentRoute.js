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

    // Add credit to user
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    const newCredit = user.credit ? user.credit + paymentInfo.totalItem > 2 ? paymentInfo.totalItem : 1 : 1;
    await userCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { credit: newCredit } });

    if (!paymentInfo) {
        return res.json({ error: 'Missing payment info in request body' });
    }
    try {
        const result = await paymentCollection.insertOne(paymentInfo);
        res.send(result);
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