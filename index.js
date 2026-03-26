require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));

// This allows the browser to get yash.jpg, but won't auto-serve index.html anymore
app.use(express.static(__dirname)); 

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
});

app.get('/', async (req, res) => {
    try {
        // 1. Database Operations
        await pool.query('UPDATE stats SET views = views + 1 WHERE id = 1');
        const [stats] = await pool.query('SELECT views FROM stats WHERE id = 1');
        const [projects] = await pool.query('SELECT * FROM projects');

        const viewCount = stats[0] ? stats[0].views : "0";
        
        // 2. Map Projects to HTML
        const projectHtml = projects.map(p => `
            <div style="background:#161b22; padding:15px; border-radius:10px; border:1px solid #30363d; margin-bottom:10px;">
                <h3 style="color:#00d4ff; margin:0;">${p.title}</h3>
                <p style="margin:5px 0 0 0;">${p.description}</p>
            </div>
        `).join('');

        // 3. Read the NEW filename
        const htmlPath = path.join(__dirname, 'template.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // 4. Force the replacement
        console.log(`Success: Injecting ${viewCount} views into template.`);
        
        htmlContent = htmlContent.replace(/{{VIEWS}}/g, viewCount);
        htmlContent = htmlContent.replace(/{{PROJECTS}}/g, projectHtml || "No projects found in TiDB.");

        // 5. Send the modified content
        res.send(htmlContent);

    } catch (error) {
        console.error("DB ERROR:", error.message);
        res.status(500).send("Database Error: " + error.message);
    }
});

app.post('/contact', async (req, res) => {
    try {
        const { name, email, msg } = req.body;
        await pool.query('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)', [name, email, msg]);
        res.send('<h1>Saved to TiDB!</h1><a href="/">Go Back</a>');
    } catch (err) {
        res.status(500).send("Form Error");
    }
});

app.listen(3000, () => console.log('Server live at http://localhost:3000'));