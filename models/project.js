const mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  demoLinks: {
    type: String,
    required: true,
  },
  githubLinks: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  cloudinary_id: [
    {
      type: String,
    },
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

projectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

projectSchema.set("toJSON", {
  virtuals: true,
});

exports.Project = mongoose.model("Project", projectSchema);

exports.projectSchema = projectSchema;
