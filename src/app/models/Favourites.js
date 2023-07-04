const mongoose = require("mongoose");
const uuid = require("node-uuid");
const Schema = mongoose.Schema;
const favouritesSchema = new Schema({
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
  userId: {
    type: String,
    default: "",
  },
  contentId: {
    type: String,
    default: "",
  },
});

mongoose.model("Favourites", favouritesSchema);
