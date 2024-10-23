const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/send-emails', upload.array('attachments'), async (req, res) => {
    const { senderEmail, appPassword, subject, message } = req.body;
    const recipients = req.body.recipients.split(','); // Assuming recipients are sent as a comma-separated string

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: senderEmail,
            pass: appPassword,
        },
    });

    // Array to hold promises
    const emailPromises = recipients.map(async (recipient) => {
        const mailOptions = {
            from: senderEmail,
            to: recipient.trim(), // Trim whitespace
            subject: subject,
            text: message,
            attachments: req.files ? req.files.map(file => ({
                filename: file.originalname,
                content: file.buffer,
            })) : [],
        };

        // Send email
        return transporter.sendMail(mailOptions);
    });

    try {
        // Await all email sending promises
        await Promise.all(emailPromises);
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
