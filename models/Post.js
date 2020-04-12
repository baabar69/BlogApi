const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "please add a title"],
    },
    textContent: {
      type: String,
      required: [true, "please add content related to title"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    image: String,
    tags: [String],
  },
  { timestamps: true }
);

module.exports = Posts = mongoose.model("posts", UserSchema);
