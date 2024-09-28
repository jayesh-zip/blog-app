const express = require('express');
const cors = require('cors');
const { connect } = require('mongoose');
const path = require('path');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const _dirname = path.resolve();

const app = express();
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Update CORS for production, replace localhost with your deployed frontend domain
app.use(cors({ credentials: true, origin: "https://blog-app-dp8f.onrender.com" })); // Change this to your production URL

// API routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Serve static files from the React app (after running `npm run build`)
app.use(express.static(path.join(_dirname, '/client/build')));


// Catch-all route to serve the frontend on any route that is not API
app.get('*', (_, res) => {
    res.sendFile(path.resolve(_dirname, 'client', 'build', 'index.html'));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);


// Connect to MongoDB
connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
    });
