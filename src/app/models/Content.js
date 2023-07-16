const mongoose = require("mongoose");
const uuid = require("node-uuid");
const Schema = mongoose.Schema;
const contentSchema = new Schema({
  _id: {
    type: String,
    default: uuid.v4,
  },
  cDate: {
    type: Number,
  },
  uDate: {
    type: Number,
  },
  creationDate: {
    type: Date,
    default: new Date(),
  },
  active: {
    type: Boolean,
    default: true,
  },
  contentTitle: {
    type: String,
    default: "",
  },
  contentDescription: {
    type: String,
    default: "",
  },
  contentImg: {
    type: String,
    default: "",
  },
  contentReleaseYear: {
    type: String,
    default: "",
  },
  contentTags: {
    type: Array,
    default: [],
  },
  contentDuration: {
    type: Number,
    default: 0
  },
  contentFileEndpoint: {
    type: String,
    default: "",
  },
  contentRating: {
    type: Number,
    default: "",
  },
  contentViews: {
    type: Number,
    default:0
  }
});

mongoose.model("Content", contentSchema);
