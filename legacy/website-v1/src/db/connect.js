import mongoose from 'mongoose';

// Function to connect to MongoDB
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // DEMO MODE (archived v1): this codebase is retired and kept only for
    // nostalgia/reference. Don't hard-exit when MongoDB is unreachable —
    // start anyway so the static pages (home/FAQ/policy/terms/login view)
    // can be browsed. Interactive features (login, dashboards, admin)
    // need a live MONGO_URI to work.
    console.warn(`⚠️  [legacy v1] MongoDB unavailable (${error.message})`);
    console.warn('⚠️  [legacy v1] Starting in VIEW-ONLY demo mode — pages render, but login/dashboards will fail without a database.');
  }
};

