const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage (replace with DB for production)
let latestReading = {
  ec: 0,
  thermistor: 0,
  tds: 0,
  color_r: 255,
  color_g: 255,
  color_b: 255,
  risk_level: "UNKNOWN",
  timestamp: 0
};

// POST /api/reading — receive data from ESP32
app.post('/api/reading', (req, res) => {
  const { ec, thermistor, tds, color_r, color_g, color_b, risk_level, timestamp } = req.body;
  
  latestReading = {
    ec: parseFloat(ec),
    thermistor: parseFloat(thermistor),
    tds: parseInt(tds),
    color_r: parseInt(color_r),
    color_g: parseInt(color_g),
    color_b: parseInt(color_b),
    risk_level: String(risk_level),
    timestamp: parseInt(timestamp)
  };
  
  console.log('Received:', latestReading);
  res.json({ success: true, message: 'Reading recorded' });
});

// GET /api/reading — serve latest data to frontend
app.get('/api/reading', (req, res) => {
  res.json(latestReading);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Render backend running on port ${PORT}`);
});
