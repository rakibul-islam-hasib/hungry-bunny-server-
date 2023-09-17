const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const applicationCollection = req.mongo.applicationCollection;
});

module.exports = router;