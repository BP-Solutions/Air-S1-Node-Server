// server.mjs

import express from 'express';

// Create an instance of the Express application
const app = express();

// Define a port for the server to listen on
const PORT = process.env.PORT || 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Basic GET endpoint
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Example GET endpoint that returns a JSON object
app.get('/api/example', (req, res) => {
    res.json({ message: 'This is an example endpoint!' });
});

// Example POST endpoint
app.post('/api/example', (req, res) => {
    const data = req.body;
    res.json({ message: 'Data received!', data });
});

// Export the app and the port
export { app, PORT };
