const express = require('express');
const router = express.Router();

router.get('/path', (req, res) => {
    res.send('Hello_World!');
});

module.exports = router;