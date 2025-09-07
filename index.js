const express = require('express');
const mongoose = require('mongoose');
const app = express();

// SUPER AGGRESSIVE CORS CONFIGURATION
app.use((req, res, next) => {
  // Allow all origins
  res.header('Access-Control-Allow-Origin', '*');
  
  // Allow all methods
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  
  // Allow all headers
  res.header('Access-Control-Allow-Headers', '*');
  
  // Allow credentials
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Set max age for preflight
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Preflight request received');
    res.status(200).end();
    return;
  }
  
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chatdb';

mongoose.connect(MONGODB_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Schema & Model
const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  msg: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Health check endpoint with CORS test
app.get('/', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    message: "🚀 HotPink Connect API is running!",
    cors: "enabled",
    timestamp: new Date().toISOString()
  });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  console.log('CORS test endpoint hit');
  res.json({ 
    message: "CORS is working!",
    origin: req.headers.origin || 'no-origin',
    method: req.method
  });
});

// POST /chat → create message
app.post('/chat', async (req, res) => {
  try {
    const { from, to, msg } = req.body;
    console.log('POST /chat received:', { from, to, msg });
    
    if (!from || !to || !msg) {
      return res.status(400).json({ error: "from, to, msg required" });
    }
    
    const newMessage = await Message.create({ from, to, msg });
    console.log('Message saved successfully:', newMessage._id);
    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error in POST /chat:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /chat → all messages
app.get('/chat', async (req, res) => {
  try {
    console.log('GET /chat requested');
    const messages = await Message.find().sort({ timestamp: 1 });
    console.log(`Returning ${messages.length} messages`);
    res.json(messages);
  } catch (err) {
    console.error('Error in GET /chat:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /chat/:user → messages by user
app.get('/chat/:user', async (req, res) => {
  try {
    const user = req.params.user;
    console.log(`GET /chat/${user} requested`);
    const userMessages = await Message.find({ 
      $or: [{ from: user }, { to: user }] 
    }).sort({ timestamp: 1 });
    console.log(`Returning ${userMessages.length} messages for ${user}`);
    res.json(userMessages);
  } catch (err) {
    console.error(`Error in GET /chat/${req.params.user}:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /chat/id/:id → message by ID
app.get('/chat/id/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`GET /chat/id/${id} requested`);
    const msg = await Message.findById(id);
    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json(msg);
  } catch (err) {
    console.error(`Error in GET /chat/id/${req.params.id}:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /chat/:id → delete message
app.delete('/chat/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`DELETE /chat/${id} requested`);
    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Message not found" });
    }
    console.log(`Message ${id} deleted successfully`);
    res.json({ success: true, deleted });
  } catch (err) {
    console.error(`Error in DELETE /chat/${req.params.id}:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

// Catch all other routes
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Chat API running on port ${PORT}`);
  console.log(`🛡️ CORS enabled for all origins`);
  console.log(`📡 Health check: GET /`);
  console.log(`🧪 CORS test: GET /cors-test`);
});