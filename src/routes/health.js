const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

module.exports = router; 