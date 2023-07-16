const mongoose = require("mongoose");
const uuid = require("node-uuid");
const Schema = mongoose.Schema;
const fileEntrySchema = new Schema({
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
  fileName: {
    type: String,
    default: "",
  },
  fileEndpoint: {
    type: String,
    default: "",
  },
  fileStatus: {
    type: String,
    default: "uploading",
  },
  totalNumberOfChunks: {
    type: Number,
    default: 0
  },
  fileGeneratedThroughChunks: {
    type: Boolean,
    default: false
  },
  convertedToHls: {
    type: Boolean,
    default: false
  },
  processingToHls: {
    type: Boolean,
    default: false
  }
});

mongoose.model("fileEntry", fileEntrySchema);
