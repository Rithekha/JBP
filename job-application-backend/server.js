const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const pdf = require('pdf-parse');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to parse JSON
app.use(express.json());

// Endpoint to handle job application submission
app.post('/api/apply', upload.single('cv'), async (req, res) => {
    const { name, email, phone } = req.body;
    const cvFile = req.file;

    try {
        // Step 1: Upload CV to S3
        const s3Response = await s3.upload({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${Date.now()}_${cvFile.originalname}`,
            Body: cvFile.buffer,
            ContentType: cvFile.mimetype,
            ACL: 'public-read',
        }).promise();

        const cvPublicLink = s3Response.Location;

        // Step 2: Extract information from the CV
        const cvData = await pdf(cvFile.buffer);
        const extractedData = extractCVData(cvData.text); // Implement this function to parse CV data

        // Step 3: Store extracted data in Google Sheets
        await storeInGoogleSheet({ name, email, phone, cvPublicLink, extractedData });

        // Step 4: Send follow-up email
        await sendFollowUpEmail(email);

        res.status(200).json({ message: 'Application submitted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing application.' });
    }
});

// Function to extract data from CV (implement your own logic)
function extractCVData(cvText) {
    // Example: Extract education, qualifications, projects, etc.
    return {
        education: [],
        qualifications: [],
        projects: [],
    };
}

// Function to store data in Google Sheets
async function storeInGoogleSheet(data) {
    const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_SHEETS_API_KEY });
    const request = {
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Sheet1!A1', // Adjust the range as needed
        valueInputOption: 'RAW',
        resource: {
            values: [[data.name, data.email, data.phone, data.cvPublicLink, JSON.stringify(data.extractedData)]],
        },
    };

    await sheets.spreadsheets.values.append(request);
}

// Function to send follow-up email
async function sendFollowUpEmail(email) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Application Under Review',
        text: 'Thank you for your application! Your CV is under review.',
    };

    await transporter.sendMail(mailOptions);
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});