require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
});

app.get('/', (req, res) => {
  // This part pulls data from TiDB
  connection.query('SELECT * FROM projects', (err, results) => {
    if (err) {
      return res.send('Database Error: ' + err.message);
    }
    
    // This part builds the HTML with the Database data
    let projectHtml = results.map(p => `<li><strong>${p.title}</strong>: ${p.description}</li>`).join('');
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Portfolio</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; padding: 50px; background: #f4f4f4; }
          .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 400px; }
          h1 { color: #007bff; }
          ul { padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Yash's Portfolio</h1>
          <p>This data is coming from <strong>TiDB Cloud</strong>:</p>
          <ul>${projectHtml}</ul>
          <hr>
          <p style="font-size: 12px; color: green;">Status: Connected to Database</p>
        </div>
      </body>
      </html>
    `);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Live at http://localhost:${PORT}`));