require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
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
  connection.query('SELECT * FROM projects', (err, results) => {
    if (err) return res.send("DB Connection Error: " + err.message);

    // This part generates the project cards dynamically
    const projectCards = results.map(p => `
      <div class="card">
        <h3 style="margin-top:0; color:#00d4ff;">${p.title}</h3>
        <p>${p.description}</p>
        <span style="font-size:0.8rem; color:#8b949e;">Tech: Node.js, SQL</span>
      </div>
    `).join('');

    // Read the HTML but inject our dynamic cards
    const fs = require('fs');
    const htmlPath = require('path').join(__dirname, 'index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Swap the placeholder with real data
    const finalHtml = htmlContent.replace(
      '<div class="card"><p>Connecting to TiDB Cloud...</p></div>', 
      projectCards
    );

    res.send(finalHtml);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Portfolio running on port ' + PORT));