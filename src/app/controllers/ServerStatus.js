const express = require("express");
const mongoose = require("mongoose");
const { countDoc } = require("../../libs/factoryFunctions");


const mainRouter = express.Router();
const APIFeatures = require("../../libs/apiFeatures");
const { sendRes } = require("../../libs/resJson");
const mainModel = mongoose.model("ServerStatus");

var middleWares = require("../../middlewares/token");
var dateGenerator = require("../../libs/dateGenerator");

module.exports.controllerFunction = function (app) {
  mainRouter.post("/create", async (req, res, next) => {
    var dateis = dateGenerator.datefunction();
    // console.log(req)
    const newModel = new mainModel({
      serverLink: req.body.serverLink,
      cDate: dateis,
      uDate: dateis,
      creationDate: new Date(),
      active: req.body.active,
    });

    newModel.save(function (err, myResponse) {
      if (err) {
        sendRes(true, 500, null, err, 0, res);
        return;
      } else {
        sendRes(false, 201, myResponse, "Created ", 1, res);
      }
    });
  });

  mainRouter.post("/readAll",  async (req, res, next) => {
    const { page, limit } = req.body;
    if (!page || !limit) {
      sendRes(true, 400, null, "page or limit is missing!", 0, res);
      return;
    }
    new APIFeatures(
      mainModel.find(function (err, response) {
        if (err) {
          sendRes(true, 500, null, err, 0, res);
          return;
        } else {
          sendRes(
            false,
            200,
            response,
            "Request successfully served.",
            response.length,
            res
          );
        }
      }),
      req.body
    )
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .search()
  });

  mainRouter.post("/readOne",  async (req, res, next) => {
    mainModel.findOne({ _id: req.body._id }, function (err, myResponse) {
      if (err) {
        sendRes(true, 500, null, err, 0, res);
        return;
      } else {
        sendRes(false, 200, myResponse, "Found", 1, res);
      }
    });
  });

  mainRouter.post("/update",  async (req, res, next) => {
    var dateis = dateGenerator.datefunction();

    const newModel = {
      ...req.body,
      uDate: dateis,
    };

    mainModel.findOneAndUpdate(
      { _id: req.body._id },
      newModel,
      {
        new: true,
      },
      function (err, myResponse) {
        if (err) {
          sendRes(true, 500, null, err, 0, res);
          return;
        } else {
          sendRes(false, 200, myResponse, "Updated", 1, res);
        }
      }
    );
  });

  mainRouter.post("/delete",  async (req, res, next) => {
    mainModel.findOneAndDelete(
      { _id: req.body._id },
      function (err, myResponse) {
        if (err) {
          sendRes(true, 500, null, err, 0, res);
          return;
        } else {
          sendRes(false, 204, myResponse, "Deleted", 1, res);
        }
      }
    );
  });

  mainRouter.post("/countDoc",  async (req, res, next) => {
    countDoc(mainModel, res, req.body);
  });

  app.use("/v1/serverStatus", mainRouter);
};
