const express = require('express');
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
router.get('/order', async (req, res) => {
    const paymentCollection = req.mongo.paymentCollection;
    
})


module.exports = router;