import mongoose from 'mongoose';

let isConnecting = false;
let reconnectTimer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[MongoDB Error]: MONGODB_URI environment variable is missing.');
    return null;
  }

  // Setup connection event listeners only once
  if (!mongoose.connection._listenersSetup) {
    mongoose.connection._listenersSetup = true;

    mongoose.connection.on('connected', () => {
      console.log(`[MongoDB]: Connection established successfully to host: ${mongoose.connection.host}`);
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB Error]: Connection error event: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB Warning]: Connection disconnected. Scheduling retry in 5s...');
      scheduleReconnect();
    });
  }

  const scheduleReconnect = () => {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(async () => {
      reconnectTimer = null;
      if (mongoose.connection.readyState === 0) {
        await connectDB();
      }
    }, 5000);
  };

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting || mongoose.connection.readyState === 2) {
    return null;
  }

  try {
    isConnecting = true;
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`[MongoDB Initial Connection Error]: ${error.message}`);
    console.warn('[MongoDB Diagnostic]: If using MongoDB Atlas, verify your current public IP is on the Atlas Network Access whitelist (https://www.mongodb.com/docs/atlas/security-whitelist/).');
    scheduleReconnect();
    return null;
  }
};

