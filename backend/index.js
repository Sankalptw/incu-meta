
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
// Routers
const { userRouter } = require("./routes/user");
const { adminRouter } = require("./routes/admin");
const legalChatbotRoutes = require('./routes/legalChatbot');
const Startup = require('./models/startup.model');
const { startupRouter } = require('./routes/startup.routes');
const { matchingRouter } = require('./routes/matching.routes');

// Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Proper CORS setup
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.static('uploads'));

// ✅ Temporary Auth Route (prevents 404 errors from frontend)
app.post('/api/auth/refresh', (req, res) => {
  return res.status(200).json({
    token: 'temporary-dummy-token',
    message: '✅ Auth refresh route working (temporary setup)'
  });
});

// Routes
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/legal', legalChatbotRoutes);
app.use('/api/startup', startupRouter);
app.use('/api/matching', matchingRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// MongoDB connection and server start
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ MongoDB connected successfully!');
    
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Connection error:', error);
    process.exit(1);
  }
}

main();
