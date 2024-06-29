const express = require('express');
const Score = require('../models/Score');
const router = express.Router();

// Submit a score
router.post('/submit', async (req, res) => {
    const { userId, quizId, score } = req.body;

    try {
        const newScore = new Score({ userId, quizId, score });
        await newScore.save();
        res.status(201).json(newScore);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
