const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const post = require("./models/Post"); // Import route index
const get = require('./models/Get')
const app = express();

app.use(cors({
    origin: ["http://127.0.0.1:5500", "https://jobpoartalapi.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


// ✅ Middleware

// Increase payload limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGO_URL;
if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing!");
    process.exit(1);
}

// Connect to MongoDB with event handling
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true ,   serverSelectionTimeoutMS: 30000  });

const db = mongoose.connection;
db.on("error", err => console.error("❌ MongoDB Connection Error:", err.message));
db.once("open", () => console.log("✅ MongoDB Connected Successfully"));

// ✅ Use Routes
app.use("/api", post);
app.use("/api", get)
// ✅ Handle 404 Errors
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ✅ Gracefully Handle Server Errors
process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
    process.exit(1);
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
