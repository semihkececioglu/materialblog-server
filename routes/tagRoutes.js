const express = require("express");
const router = express.Router();
const Tag = require("../models/Tags");
const Post = require("../models/Post");

// Get all tags
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Add new tag
router.post("/", async (req, res) => {
  try {
    const newTag = new Tag({ name: req.body.name });
    const saved = await newTag.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Etiket eklenemedi" });
  }
});

// Update tag
router.put("/:id", async (req, res) => {
  try {
    const updated = await Tag.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Etiket güncellenemedi" });
  }
});

// Delete tag
router.delete("/:id", async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Etiket silinemedi" });
  }
});

// Popüler etiketler (en çok kullanılan ilk 6)
router.get("/popular", async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: "$tags" }, // her tag'i ayır
      { $group: { _id: "$tags", count: { $sum: 1 } } }, // tagId bazlı grupla
      { $sort: { count: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "tags", // MongoDB'deki collection ismi (küçük harf + çoğul)
          localField: "_id",
          foreignField: "_id",
          as: "tagDetails",
        },
      },
      { $unwind: "$tagDetails" },
      {
        $project: {
          _id: 0,
          id: "$tagDetails._id",
          name: "$tagDetails.name",
          tagSlug: "$tagDetails.tagSlug",
          count: 1,
        },
      },
    ]);

    res.json(tags);
  } catch (err) {
    console.error("Popüler etiketler alınamadı:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Tag bilgisi endpoint'i ekle
router.get("/info/:tagName", async (req, res) => {
  try {
    const tagName = decodeURIComponent(req.params.tagName);

    // Tag'i bul
    const tag = await Tag.findOne({
      name: { $regex: new RegExp(`^${tagName}$`, "i") },
    });

    if (!tag) {
      return res.status(404).json({ error: "Etiket bulunamadı" });
    }

    // Bu tag'e ait yazı sayısını bul
    const postCount = await Post.countDocuments({ tags: tag._id });

    res.json({
      name: tag.name,
      count: postCount,
      id: tag._id,
    });
  } catch (err) {
    console.error("Tag bilgisi alınamadı:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

module.exports = router;
