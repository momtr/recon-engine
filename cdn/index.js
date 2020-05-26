const express = require('express');
const router = express.Router();

router.get('/reco.js', (req, res, next) => {
    res.sendFile(__dirname + '/static/reco.js');
});

module.exports = router;