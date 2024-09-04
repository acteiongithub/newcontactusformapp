const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// AWS SES Configuration
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');

    const firstname = 'Robert';
    const lastname = 'S William';
    const email = 'roberts.william@acteion.com';
    const phone = '3124565845';
    const message = 'Hello, this is a test message. Inserting from Node JS.';

    const sql = `
        INSERT INTO customers (firstname, lastname, email, phone, message)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            firstname = VALUES(firstname),
            lastname = VALUES(lastname),
            phone = VALUES(phone),
            message = VALUES(message);
    `;

    db.query(sql, [firstname, lastname, email, phone, message], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return;
        }
        console.log('Data inserted successfully:', result);

        // Fetch data from the database after inserting
        const fetchSql = 'SELECT * FROM customers';
        db.query(fetchSql, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return;
            }
            // Print the fetched data to the console
            console.log('Fetched data from MySQL: ', results);
        });
    });
});

// Function to send emails using AWS SES
const sendEmail = (to, subject, body) => {
    const params = {
        Source: process.env.SES_SOURCE_EMAIL, // Verified source email
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8'
            },
            Body: {
                Html: {
                    Data: body,
                    Charset: 'UTF-8'
                }
            }
        }
    };

    return ses.sendEmail(params).promise();
};

// Route to handle form submission
app.post('/api/postcontacts', async (req, res) => {
    const { firstname, lastname, email, phone, message } = req.body;
    const sql = `
        INSERT INTO customers (firstname, lastname, email, phone, message)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            firstname = VALUES(firstname),
            lastname = VALUES(lastname),
            phone = VALUES(phone),
            message = VALUES(message);
    `;

    db.query(sql, [firstname, lastname, email, phone, message], async (err, result) => {
        if (err) {
            console.error('Error saving data:', err);
            res.status(500).send('Error saving data');
            return;
        }

        // Sending emails using AWS SES
        try {
            // Admin notification email
            await sendEmail(
                process.env.ADMIN_EMAIL, 
                'New Contact Form Submission', 
                '<p>A new contact form has been submitted by ${firstname} ${lastname}.</p><p>Email: ${email}</p><p>Phone: ${phone}</p><p>Message: ${message}</p>'
            );

            // Acknowledgment email to the user
            await sendEmail(
                email,
                'Thank you for contacting us',
                '<p>Dear ${firstname},</p><p>Thank you for reaching out to us. We have received your message and will get back to you soon.</p><p>Best regards,<br>Your Company</p>'
            );

            res.send('Contact saved successfully.');
        } catch (emailErr) {
            console.error('Error sending emails:', emailErr);
            res.status(500).send('Error saving data and sending emails');
        }
    });
});

// Route to fetch all contacts
app.get('/api/getcontacts', (req, res) => {
    const sql = 'SELECT * FROM customers';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
            return;
        }
        // Print the data to the console
        console.log('Fetched data from MySQL: ', results);
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
