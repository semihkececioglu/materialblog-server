const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");

// ── Yardımcı: Tekil (singleton) kaydı getir/oluştur
async function getSingleton() {
  let s = await Settings.findOne({});
  if (!s) s = await Settings.create({});
  return s;
}

// ── PUBLIC: Frontend'in GA bilgilerini güvenli şekilde alması için
// (Auth yok; yalnızca gerekli alanlar döner)
router.get("/public", async (_req, res) => {
  try {
    const s = await getSingleton();
    res.json({
      gaEnabled: !!s.gaEnabled,
      gaMeasurementId: s.gaMeasurementId || "",
      // ⚠️ Burada propertyId dönmüyoruz, güvenlik için yalnızca Measurement ID
    });
  } catch (err) {
    res.status(500).json({ message: "Public ayarlar alınamadı" });
  }
});

// ── ADMIN: Tüm ayarları getir (site + GA)
router.get("/", async (_req, res) => {
  try {
    const s = await getSingleton();
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: "Ayarlar alınamadı" });
  }
});

// ── ADMIN: Ayarları güncelle
router.put("/", async (req, res) => {
  const {
    siteTitle,
    siteDescription,
    gaEnabled,
    gaMeasurementId,
    gaPropertyId, // yeni alan
  } = req.body;

  try {
    const s = await getSingleton();

    if (typeof siteTitle === "string") s.siteTitle = siteTitle;
    if (typeof siteDescription === "string")
      s.siteDescription = siteDescription;

    // GA alanları
    if (typeof gaEnabled === "boolean") s.gaEnabled = gaEnabled;
    if (typeof gaMeasurementId === "string")
      s.gaMeasurementId = gaMeasurementId.trim();
    if (typeof gaPropertyId === "string") s.gaPropertyId = gaPropertyId.trim();

    await s.save();
    res.json(s);
  } catch (err) {
    console.error("Settings update error:", err);
    res.status(500).json({ message: "Ayarlar güncellenemedi" });
  }
});

module.exports = router;
