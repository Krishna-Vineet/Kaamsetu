import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log masked configuration once (dev only — keep production logs clean)
if (process.env.NODE_ENV !== 'production') {
  console.log('Cloudinary Configuration:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'NOT_SET',
    api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'NOT_SET',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'NOT_SET'
  });
}

export default cloudinary;
