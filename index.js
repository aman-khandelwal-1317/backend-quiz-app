const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const authRoutes = require('./server/routes/auth');
const quizRoutes = require('./server/routes/quiz');
const scoreRoutes = require('./server/routes/score');

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/score', scoreRoutes);


app.get('/', (req, res) => {
    res.send('API is running!');
  });
  

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
