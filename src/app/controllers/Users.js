const express = require("express");
const mongoose = require("mongoose");
const { countDoc } = require("../../libs/factoryFunctions");
var crypto = require('crypto'); 

const mainRouter = express.Router();
const APIFeatures = require("../../libs/apiFeatures");
const { sendRes } = require("../../libs/resJson");
const mainModel = mongoose.model("Users");

var middleWares = require("../../middlewares/token");
var dateGenerator = require("../../libs/dateGenerator");

module.exports.controllerFunction = function (app) {
  mainRouter.post("/create", middleWares.Filter, async (req, res, next) => {
    var dateis = dateGenerator.datefunction();

    let salt = crypto.randomBytes(16).toString('hex');
    let hash = crypto.pbkdf2Sync(req.body.password, salt,  
    1000, 64, `sha512`).toString(`hex`);

    const newModel = new mainModel({
      salt: salt,
      userName: req.body.userName,
      email: req.body.email,
      password: hash,
      planSelected: req.body.planSelected,
      isAdmin: req.body.isAdmin,
      cDate: dateis,
      uDate: dateis,
      creationDate: new Date(),
      active: req.body.active,
    });

    newModel.save(function (err, myResponse) {
      if (err) {
        console.log("ERROR IS -> ",err)
        sendRes(true, 500, null, err, 0, res);
        return;
      } else {
        sendRes(false, 201, myResponse, "Created ", 1, res);
      }
    });
  });

  mainRouter.post("/readAll", middleWares.Filter, async (req, res, next) => {
    const { page, limit } = req.body;
    if (!page || !limit) {
      sendRes(true, 400, null, "page or limit is missing!", 0, res);
      return;
    }
    let password = null;
    if("password" in req.body)
    {
      password = req.body.password;
      delete req.body.password;
    }
    new APIFeatures(
      mainModel.find(function (err, response) {
        if (err) {
          sendRes(true, 500, null, err, 0, res);
          return;
        } else {
          if(response != null && response != undefined && response.length > 0 && password != null)
          {
            let salt = response[0]?.salt
            let hash = crypto.pbkdf2Sync(password, salt,  
            1000, 64, `sha512`).toString(`hex`);
            console.log(`HASH ${response[0].password} AND GENERATED HASH ${hash}`)
            if(hash != response[0].password)
            {
              response = [];
            }
          }

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

  mainRouter.post("/readOne", middleWares.Filter, async (req, res, next) => {
    mainModel.findOne({ _id: req.body._id }, function (err, myResponse) {
      if (err) {
        sendRes(true, 500, null, err, 0, res);
        return;
      } else {
        sendRes(false, 200, myResponse, "Found", 1, res);
      }
    });
  });

  mainRouter.post("/update", middleWares.Filter, async (req, res, next) => {
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

  mainRouter.post("/delete", middleWares.Filter, async (req, res, next) => {
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

  mainRouter.post("/countDoc", middleWares.Filter, async (req, res, next) => {
    countDoc(mainModel, res, req.body);
  });

  app.use("/v1/users", mainRouter);
};
