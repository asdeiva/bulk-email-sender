const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const WebSocket = require('ws'); // Import WebSocket
const http = require('http'); // For creating an HTTP server

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // Create a WebSocket server

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');
});

// Send emails with WebSocket updates
app.post('/send-emails', upload.array('attachments'), async (req, res) => {
    const { senderEmail, appPassword, subject, message } = req.body;
    const recipients = req.body.recipients.split(',').map(email => email.trim()); // Convert string to array
    const totalRecipients = recipients.length;
    let sentCount = 0; // Count of sent emails

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: senderEmail,
            pass: appPassword,
        },
    });

    try {
        for (const recipient of recipients) {
            const mailOptions = {
                from: senderEmail,
                to: recipient,
                subject: subject,
                text: message,
                attachments: req.files ? req.files.map(file => ({
                    filename: file.originalname,
                    content: file.buffer,
                })) : [],
            };

            await transporter.sendMail(mailOptions);
            sentCount++;

            // Log the sending status
            const logMessage = `Email sent to: ${recipient} at ${new Date().toISOString()}\n`;
            // fs.appendFileSync('email_log.txt', logMessage);
            console.log(logMessage);

            // Send update to all connected clients
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ sentCount, totalRecipients }));
                }
            });
        }

        res.status(200).json({ message: `Emails sent successfully! ${sentCount} out of ${totalRecipients} emails sent.` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send emails: ' + error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
