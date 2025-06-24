const express = require("express");
const multer = require("multer");
const { cloudinary } = require("../utils/cloudinary");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "materialblog",
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary Yükleme Hatası:", error);
    res.status(500).json({ error: "Yükleme başarısız" });
  }
});

module.exports = router;
