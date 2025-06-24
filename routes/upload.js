const express = require("express");
const multer = require("multer");
const { storage } = require("../utils/cloudinary");

const router = express.Router();
const upload = multer({ storage });

// ✅ Cloudinary'e yükleme
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ error: "Görsel yüklenemedi" });
  }

  // Cloudinary'den dönen url
  res.json({ url: req.file.path });
});

module.exports = router;
