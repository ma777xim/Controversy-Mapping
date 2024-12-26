
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

