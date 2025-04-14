const mysql = require("mysql2/promise");
const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = 5000;
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'priyanka',
    password: 'qwerty@1234',
    database: 'Tree'
});

// Enable CORS
app.use(cors());

app.post('/insertTreeData', async (req, res) => {
    const treeData = req.body;

    try {
        const connection = await pool.getConnection();
        console.log('Connected to the database');

        // Recursively insert each node and its children into the table
        await insertNode(connection, null, treeData);

        connection.release(); // Release the connection back to the pool

        console.log('Data inserted successfully');
        res.status(200).send('Data inserted successfully');
    } catch (error) {
        console.error('Error inserting data into the database:', error.message);
        res.status(500).send('Error inserting data into the database');
    }
});

async function insertNode(connection, parentId, node) {
    // Insert the current node
    const children = node.children ? JSON.stringify(node.children) : null;
    const [result] = await connection.execute('INSERT INTO firstTable (root, children) VALUES (?, ?)', [node.name, children]);
    const nodeId = result.insertId;

    // Recursively insert children
    if (node.children) {
        for (const child of node.children) {
            await insertNode(connection, nodeId, child);
        }
    }
}

// Usage
const treeData = {
    name: 'Beverages',
    children: [
        {
            name: 'Water'
        },
        {
            name: 'Coffee'
        },
        {
            name: 'Tea',
            children: [
                {
                    name: 'Black Tea'
                },
                {
                    name: 'White Tea'
                },
                {
                    name: 'Green Tea',
                    children: [
                        {
                            name: 'Sencha'
                        },
                        {
                            name: 'Gyokuro'
                        },
                        {
                            name: 'Matcha'
                        },
                        {
                            name: 'Pi Lo Chun'
                        }
                    ]
                }
            ]
        }
    ]
};


// Route to fetch data from the database
app.get('/getData', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to the database');
        const [rows, fields] = await connection.query('SELECT * FROM firstTable');
        res.json(rows);
        connection.release(); // Release the connection back to the pool
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
