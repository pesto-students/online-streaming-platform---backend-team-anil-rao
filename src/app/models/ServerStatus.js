const mongoose = require("mongoose");
const uuid = require("node-uuid");
const Schema = mongoose.Schema;
const serverStatusSchema = new Schema({
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
  serverLink: {
    type: String,
    default: "",
  },
  assignedFileEndpoint: {
    type: String,
    default: "",
  },
  assignedFileTask: {
    type: String,
    default: "",
  },
  // serverStatus: {
  //   type: String,
  //   default: "",
  // },
});

mongoose.model("ServerStatus", serverStatusSchema);
