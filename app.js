const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./config/db");

const githubRoutes = require("./routes/githubRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", githubRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("🚀 GitHub Profile Analyzer API is Running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});