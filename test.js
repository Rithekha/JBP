// Import dotenv using ES module syntax
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Print the environment variables
console.log("AWS Access Key:", process.env.AWS_ACCESS_KEY_ID);
console.log("S3 Bucket Name:", process.env.S3_BUCKET_NAME);
