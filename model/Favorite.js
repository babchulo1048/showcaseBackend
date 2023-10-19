const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  files: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
  ],
});

const Favorites = mongoose.model("favorites", favoriteSchema);

module.exports = Favorites;
