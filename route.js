const express = require('express');
const connectToDatabase = require('./connection'); // Import the function to connect to the database

const app = express();

// Route to fetch data from the database
app.get('/getData', async (req, res) => {
    try {
        const connection = await connectToDatabase();
        const [rows, fields] = await connection.execute('SELECT * FROM firstTable');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
