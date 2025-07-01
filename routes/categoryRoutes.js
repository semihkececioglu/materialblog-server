const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Post = require("../models/Post"); // with-count için gerekli

// GET /api/categories — Tüm kategoriler (isim sırasına göre)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Kategori listesi alınamadı" });
  }
});

// GET /api/categories/with-count — Her kategori için yazı sayısı
router.get("/with-count", async (req, res) => {
  try {
    const categories = await Category.find();

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Post.countDocuments({ category: cat._id });
        return {
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          count,
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (err) {
    res.status(500).json({ message: "Kategori yazı sayıları alınamadı" });
  }
});

// POST /api/categories — Yeni kategori oluştur
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    // Yeni kategori oluştur, slug otomatik üretilir (model içinde)
    const newCategory = new Category({ name });
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Kategori oluşturulamadı", error: err.message });
  }
});

// PUT /api/categories/:id — Kategori güncelle (slug da güncellenir)
router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Kategori bulunamadı" });

    category.name = req.body.name;
    await category.save(); // Slug otomatik güncellenir (model pre validate içinde)

    res.json(category);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Kategori güncellenemedi", error: err.message });
  }
});

// DELETE /api/categories/:id — Kategori sil
router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res
      .status(400)
      .json({ message: "Kategori silinemedi", error: err.message });
  }
});

module.exports = router;
