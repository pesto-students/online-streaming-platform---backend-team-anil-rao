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
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  planSelected:{
    type: String,
    enum: ["basic", "standard", "premium", "none"],
    default: "none",
  },
  isAdmin:{
    type: Boolean,
    default: false
  },
  salt:{
    type:String,
    default:""
  }
});

mongoose.model("Users", userSchema);
