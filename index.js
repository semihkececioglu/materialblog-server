const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const postRoutes = require("./routes/postRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tagRoutes = require("./routes/tagRoutes");
const commentRoutes = require("./routes/comments");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settings");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Route tanımları
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB bağlantısı başarılı");
    app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));
  })
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));
