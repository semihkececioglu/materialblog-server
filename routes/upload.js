const express = require("express");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const router = express.Router();

// multer memory storage (dosya diske yazılmaz)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Görsel bulunamadı" });
    }

    const result = await cloudinary.uploader.upload_stream(
      { folder: "materialblog", resource_type: "image" },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: "Cloudinary yükleme hatası" });
        }
        return res.status(200).json({ url: result.secure_url });
      }
    );

    // Pipe buffer to stream
    const stream = require("stream");
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);
    bufferStream.pipe(result);
  } catch (err) {
    res.status(500).json({ error: "Yükleme başarısız" });
  }
});

module.exports = router;
