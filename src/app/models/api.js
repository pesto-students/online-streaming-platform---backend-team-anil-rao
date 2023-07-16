const mongoose = require("mongoose");
const uuid = require("node-uuid");
const Schema = mongoose.Schema;
const userSchema = new Schema({
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
  userName: {
    type: String,
    default: "",
  },
  phoneNumber: {
    type: String,
    required: true,
  },
});

mongoose.model("api", userSchema);
