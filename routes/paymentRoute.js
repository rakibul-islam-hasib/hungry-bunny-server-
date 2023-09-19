const express = require('express');
const verifyJWT = require('../middleware/verifyJWT');
const { ObjectId } = require('mongodb');
const generateInvoicePDF = require('../middleware/generateInvoicePDF');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const moment = require('moment');




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


router.get('/ok', (req, res) => res.send('ok'))

// Post payment info to database
router.post('/post-payment-info', async (req, res) => {
    const paymentCollection = req.mongo.paymentCollection;
    const userCollection = req.mongo.usersCollection;
    const foodCollection = req.mongo.foodCollection;
    const applicationCollection = req.mongo.applicationCollection;
    const paymentInfo = req.body;
    const userId = paymentInfo.userId;
    const orderedItem = paymentInfo.orderedItem;
    // Add object id to the ordered item
    orderedItem.forEach(item => {
        item.foodId = new ObjectId(item.foodId);
    });
    paymentInfo.deliveryStatus = 'pending';

    // Now update credit to the food item 

    if (!paymentInfo) {
        return res.json({ error: 'Missing payment info in request body' });
    }

    try {
        const restaurantIds = [...new Set(orderedItem.map(item => item.restaurantId))];

        for (const restaurantId of restaurantIds) {
            const itemsForRestaurant = orderedItem.filter(item => item.restaurantId === restaurantId);

            const totalQuantityForRestaurant = itemsForRestaurant.reduce((total, item) => total + item.quantity, 0);

            for (const item of itemsForRestaurant) {
                const foodId = new ObjectId(item.foodId);
                const quantity = item.quantity;
                const foodItem = await foodCollection.findOne({ _id: foodId, restaurant_id: restaurantId });

                if (!foodItem) {
                    return res.json({ error: `Food item with ID ${item.foodId} not found for restaurant ${restaurantId}` });
                }

                if (foodItem.quantity < quantity) {
                    return res.json({ error: `Insufficient quantity for food item with ID ${item.foodId} at restaurant ${restaurantId}` });
                }

                await foodCollection.updateOne(
                    { _id: foodId, restaurant_id: restaurantId },
                    { $inc: { quantity: -quantity } }
                );
            }

            const restaurant = await applicationCollection.findOne({ _id: new ObjectId(restaurantId) });

            if (!restaurant) {
                return res.json({ error: `Restaurant with ID ${restaurantId} not found` });
            }

            const newRestaurantCredit = restaurant.credit ? restaurant.credit + totalQuantityForRestaurant : totalQuantityForRestaurant;

            await applicationCollection.updateOne(
                { _id: new ObjectId(restaurantId) },
                { $set: { credit: newRestaurantCredit } }
            );

            await applicationCollection.updateOne(
                { _id: new ObjectId(restaurantId) },
                { $push: { orders: paymentInfo } }
            );
        }
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.json({ error: 'User not found' });
        }

        // Calculate the new credit for the user
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
});

// All payment 
router.get('/all-payment', async (req, res) => {
    const paymentCollection = req.mongo.paymentCollection;
    try {
        const result = await paymentCollection.find({}).toArray();
        res.send(result);
    } catch (err) {
        console.log(err);
        res.send({ error: err });
    }
});



// Get the food item by payment collection orderedItem.map(item => item.foodId)
router.get('/food-item/:paymentId', async (req, res) => {
    const paymentCollection = req.mongo.paymentCollection;
    const foodCollection = req.mongo.foodCollection;
    const paymentId = req.params.paymentId;
    try {
        const paymentResult = await paymentCollection.findOne({ _id: new ObjectId(paymentId) });
        const foodIds = paymentResult.orderedItem.map(item => new ObjectId(item.foodId));
        const foodItems = await foodCollection.find({ _id: { $in: foodIds } }).toArray();
        const formattedDate = moment.unix(paymentResult.paymentDate).format('MMMM Do YYYY');


        const invoiceData = {
            date: formattedDate,
            amountDue: 0,
            items: foodItems.map(item => ({
                name: item.food_name,
                description: 'Not available',
                rate: item.price,
                quantity: paymentResult.orderedItem.find(orderedItem => orderedItem.foodId === item._id.toString()).quantity,
                price: item.price * paymentResult.orderedItem.find(orderedItem => orderedItem.foodId === item._id.toString()).quantity
            })),
            totalPaid: paymentResult.paymentAmount,
            name: paymentResult.userName,
            email: paymentResult.userEmail,
        };

        const pdfBuffer = await generateInvoicePDF(invoiceData);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=invoice.pdf');

        // Send the PDF buffer as the response
        res.send(pdfBuffer);

    } catch (err) {
        console.log(err);
        res.send({ error: err });
    }
});


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