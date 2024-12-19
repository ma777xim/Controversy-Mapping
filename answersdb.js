const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Your MySQL password
    database: 'mappers',
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
});

// Handle form submission
app.post('/submit', (req, res) => {
    const { topic, answer } = req.body;

    if (!topic || !answer) {
        return res.status(400).send('All fields are required.');
    }

    const sql = 'INSERT INTO users (topic, answer) VALUES (?, ?)';
    db.query(sql, [topic, answer], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error.');
        }
        res.status(200).send('Data saved successfully.');
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
