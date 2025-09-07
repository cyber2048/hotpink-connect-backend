const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Use CORS package - this is much more reliable //earlier I used cors middlewear
app.use(cors({
  origin: '*', // Allow all origins for now
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB connection - using environment variable for production
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

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: "🚀 HotPink Connect API is running!" });
});

// POST /chat → create message
app.post('/chat', async (req, res) => {
  const { from, to, msg } = req.body;
  console.log('Received message:', { from, to, msg });
  
  if (!from || !to || !msg) {
    return res.status(400).json({ error: "from, to, msg required" });
  }
  
  try {
    const newMessage = await Message.create({ from, to, msg });
    console.log('Message saved:', newMessage);
    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /chat → all messages
app.get('/chat', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /chat/:user → messages by user
app.get('/chat/:user', async (req, res) => {
  const user = req.params.user;
  try {
    const userMessages = await Message.find({ 
      $or: [{ from: user }, { to: user }] 
    }).sort({ timestamp: 1 });
    res.json(userMessages);
  } catch (err) {
    console.error('Error fetching user messages:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /chat/id/:id → message by ID
app.get('/chat/id/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: "Message not found" });
    res.json(msg);
  } catch (err) {
    console.error('Error fetching message by ID:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /chat/:id → delete message
app.delete('/chat/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Message not found" });
    res.json({ success: true, deleted });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// Use PORT from environment or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Chat API running on port ${PORT}`));