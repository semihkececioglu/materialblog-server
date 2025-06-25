const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");

// 📌 Tüm postlar + search + kategori + tag + pagination destekli
router.get("/", async (req, res) => {
  try {
    const { category, tag, search, page = 1, limit = 6 } = req.query;

    let filter = {};

    // 🔍 Arama
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ title: regex }, { summary: regex }, { content: regex }];
    }

    // 📂 Kategori filtresi
    if (category) {
      filter.categorySlug = category;
    }

    // 🏷 Etiket filtresi
    if (tag) {
      filter.tags = tag;
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Postları alırken hata:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// 🔎 Tekil postu ID ile getir (ID bazlı)
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Yazı bulunamadı" });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// 🆕 Yeni post oluştur
router.post("/", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ error: "Geçersiz veri!" });
  }
});

// ✏️ Post güncelle
router.put("/:id", async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedPost) {
      return res.status(404).json({ error: "Yazı bulunamadı" });
    }
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// 🗑️ Post sil
router.delete("/:id", async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ error: "Yazı bulunamadı" });
    }
    res.json({ message: "Yazı silindi" });
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// ❤️ Like / Unlike
router.post("/slug/:slug/like", async (req, res) => {
  const { slug } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findOne({ slug });
    const user = await User.findById(userId);

    if (!post || !user) return res.status(404).json({ message: "Bulunamadı" });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
      user.likedPosts.pull(post._id);
    } else {
      post.likes.push(userId);
      user.likedPosts.push(post._id);
    }

    await post.save();
    await user.save();

    res.status(200).json({
      liked: !alreadyLiked,
      likeCount: post.likes.length,
    });
  } catch (error) {
    console.error("Like işlem hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// 📌 Beğeni durumu getir (slug + userId ile)
router.get("/slug/:slug/like-status", async (req, res) => {
  const { slug } = req.params;
  const { userId } = req.query;

  try {
    const post = await Post.findOne({ slug });
    if (!post) return res.status(404).json({ message: "Post bulunamadı" });

    const liked = post.likes.includes(userId);

    res.status(200).json({
      liked,
      likeCount: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// 📥 Save / Unsave (bookmark)
router.post("/slug/:slug/save", async (req, res) => {
  const { slug } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findOne({ slug });
    const user = await User.findById(userId);

    if (!post || !user) return res.status(404).json({ message: "Bulunamadı" });

    const alreadySaved = user.savedPosts.includes(post._id);

    if (alreadySaved) {
      user.savedPosts.pull(post._id);
    } else {
      user.savedPosts.push(post._id);
    }

    await user.save();

    res.status(200).json({
      saved: !alreadySaved,
    });
  } catch (error) {
    console.error("Save işlem hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});
