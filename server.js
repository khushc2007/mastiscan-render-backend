const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());

// ============================================================
// LATEST READING
// ============================================================

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

// ============================================================
// VALIDATION HELPER
// ============================================================

function isValidNumber(value) {
  return value !== undefined &&
         value !== null &&
         value !== "" &&
         Number.isFinite(Number(value));
}

// ============================================================
// POST /api/reading
// ESP32 → Render
// ============================================================

app.post("/api/reading", (req, res) => {

  try {

    const {
      ec,
      thermistor,
      tds,
      color_r,
      color_g,
      color_b,
      risk_level,
      timestamp
    } = req.body;

    // ----------------------------------------------------------
    // Validate required fields
    // ----------------------------------------------------------

    if (
      !isValidNumber(ec) ||
      !isValidNumber(thermistor) ||
      !isValidNumber(tds) ||
      !isValidNumber(color_r) ||
      !isValidNumber(color_g) ||
      !isValidNumber(color_b) ||
      !isValidNumber(timestamp)
    ) {

      console.log(
        "Rejected invalid reading:",
        req.body
      );

      return res.status(400).json({
        success: false,
        message: "Invalid sensor data"
      });
    }

    // ----------------------------------------------------------
    // Validate risk level
    // ----------------------------------------------------------

    const normalizedRisk =
      String(risk_level || "UNKNOWN").toUpperCase();

    if (
      !["LOW", "MEDIUM", "HIGH", "UNKNOWN"]
        .includes(normalizedRisk)
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid risk level"
      });
    }

    // ----------------------------------------------------------
    // Store reading
    // ----------------------------------------------------------

    latestReading = {

      ec: Number(ec),

      thermistor: Number(thermistor),

      tds: Number(tds),

      color_r: Number(color_r),

      color_g: Number(color_g),

      color_b: Number(color_b),

      risk_level: normalizedRisk,

      timestamp: Number(timestamp)
    };

    // ----------------------------------------------------------
    // Server log
    // ----------------------------------------------------------

    console.log(
      "================================"
    );

    console.log(
      "MASTISCAN READING RECEIVED"
    );

    console.log(
      latestReading
    );

    console.log(
      "================================"
    );

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    return res.status(200).json({

      success: true,

      message: "Reading recorded",

      reading: latestReading
    });

  }

  catch (error) {

    console.error(
      "POST /api/reading error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Server error"
    });
  }
});

// ============================================================
// GET /api/reading
// Render → Frontend
// ============================================================

app.get("/api/reading", (req, res) => {

  res.status(200).json(
    latestReading
  );
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/health", (req, res) => {

  res.status(200).json({

    status: "ok",

    service: "MastiScan Backend",

    timestamp: Date.now()
  });
});

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message: "Route not found"
  });
});

// ============================================================
// SERVER
// ============================================================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `MastiScan backend running on port ${PORT}`
  );

  console.log(
    `Port: ${PORT}`
  );
});
