const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Connect to MySQL
require("./config/db");

const githubRoutes = require("./routes/githubRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve Frontend
app.use(express.static("public"));

// API Routes
app.use("/api", githubRoutes);

// Home Route
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});