const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
});

categorySchema.pre("validate", function (next) {
  if (this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => {
        const map = {
          ç: "c",
          Ç: "c",
          ğ: "g",
          Ğ: "g",
          ı: "i",
          İ: "i",
          ö: "o",
          Ö: "o",
          ş: "s",
          Ş: "s",
          ü: "u",
          Ü: "u",
        };
        return map[c] || c;
      })
      .replace(/[^\w-]+/g, "");
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
