// Use Google DNS so mongodb+srv:// addresses resolve on every network
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const caseRoutes = require('./routes/caseRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the React frontend to call this API
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

// Let the server read JSON sent in requests (with a size limit)
app.use(express.json({ limit: '10kb' }));

// Health check: confirms the API is running
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'AI Mystery Room API is running',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected',
    });
});

// Case routes
app.use('/api/cases', caseRoutes);

// Must come after all routes
app.use(errorHandler);

// Connect to MongoDB first, then start the server
async function start() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

start();