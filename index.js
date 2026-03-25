require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true })); // Lets us read form data

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
});

// MAIN ROUTE: Shows Portfolio + Visitor Counter
app.get('/', (req, res) => {
  // Update Visitor Count in DB
  connection.query('UPDATE stats SET views = views + 1 WHERE id = 1');

  // Get everything to show the user
  connection.query('SELECT (SELECT views FROM stats WHERE id = 1) as viewCount, title, description FROM projects', (err, results) => {
    if (err) return res.send("DB Error: " + err.message);

    const viewCount = results[0]?.viewCount || 0;
    const projectCards = results.map(p => `
      <div class="card">
        <h3 style="color:#00d4ff;">${p.title}</h3>
        <p>${p.description}</p>
      </div>
    `).join('');

    res.send(require('fs').readFileSync('./index.html', 'utf8')
      .replace('{{PROJECTS}}', projectCards)
      .replace('{{VIEWS}}', viewCount));
  });
});

// CONTACT ROUTE: Proof of DB Writing
app.post('/contact', (req, res) => {
  const { name, email, msg } = req.body;
  const sql = 'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)';
  connection.query(sql, [name, email, msg], (err) => {
    if (err) return res.send("Error saving message.");
    res.send('<h1>Message Sent!</h1><a href="/">Go Back</a>');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Portfolio Live!'));