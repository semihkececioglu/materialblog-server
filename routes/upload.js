const express = require("express");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const { Readable } = require("stream");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Dosya bulunamadı" });

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "materialblog",
      },
      (error, result) => {
        if (error) return res.status(500).json({ error: "Yükleme hatası" });
        return res.json({ url: result.secure_url });
      }
    );

    Readable.from(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error("Yükleme hatası:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

module.exports = router;
