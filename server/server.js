const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Import fs for file operations
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/send-emails', upload.array('attachments'), async (req, res) => {
    const { senderEmail, appPassword, subject, message } = req.body;
    const recipients = req.body.recipients.split(',').map(email => email.trim()); // Convert string to array

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: senderEmail,
            pass: appPassword,
        },
    });

    // Loop through each recipient and send email separately
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

            // Log the sending status
            const logMessage = `Email sent to: ${recipient} at ${new Date().toISOString()}\n`;
            // fs.appendFileSync('email_log.txt', logMessage); // Append to log file
            console.log(logMessage); // Log to console as well
        }

        res.status(200).json({ message: 'Emails sent successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send emails: ' + error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
