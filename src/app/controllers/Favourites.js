const express = require("express");
const mongoose = require("mongoose");
const { countDoc } = require("../../libs/factoryFunctions");


const mainRouter = express.Router();
const APIFeatures = require("../../libs/apiFeatures");
const { sendRes } = require("../../libs/resJson");
const mainModel = mongoose.model("Favourites");
const contentModel = mongoose.model("Content");

var middleWares = require("../../middlewares/token");
var dateGenerator = require("../../libs/dateGenerator");

module.exports.controllerFunction = function (app) {
  mainRouter.post("/create", middleWares.Filter, async (req, res, next) => {
    var dateis = dateGenerator.datefunction();
    const newModel = new mainModel({
      contentId: req.body.contentId,
      userId: req.body.userId,
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

  mainRouter.post("/readAll", middleWares.Filter, async (req, res, next) => {
    const { page, limit } = req.body;
    if (!page || !limit) {
      sendRes(true, 400, null, "page or limit is missing!", 0, res);
      return;
    }
    new APIFeatures(
      mainModel.find(async function (err, response) {
        if (err) {
          sendRes(true, 500, null, err, 0, res);
          return;
        } else {
          let tempResp = [];
          await new Promise(async (resolve) => {
            if(response.length == 0)
              resolve();
            for(let i=0;i<response.length;i++)
            {
              console.log("RESPONSE[i] -> ",response[i])
              let contentData = await new Promise((resolve) => {
                contentModel.findOne({_id:response[i].contentId},(err,contentData) => {
                  if(contentData != null)
                    resolve(contentData);
                  else
                    resolve({});
                })
              })
              let tempObj=response[i];
              // console.log("tempObj IS -> ",tempObj)
              // console.log("contentData IS -> ",contentData)
              tempResp.push({favouritesData:tempObj,contentData:contentData});
              // console.log("tempResp IS -> ",tempResp)
              if(response.length-1 == i)
              resolve();
            }
          })
          sendRes(
            false,
            200,
            tempResp,
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
    mainModel.findOne({ _id: req.body._id },async function (err, myResponse) {
      if (err) {
        sendRes(true, 500, null, err, 0, res);
        return;
      } else {
        console.log("RESPONSE IS -> ",myResponse)
        let contentData = await new Promise((resolve) => {
          contentModel.findOne({_id:myResponse.contentId},(err,contentData) => {
            if(contentData != null)
              resolve(contentData);
            else
              resolve({});
          })
        })
        sendRes(false, 200, {favouritesData:myResponse,contentData:contentData}, "Found", 1, res);
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
      req.body,
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

  app.use("/v1/favourites", mainRouter);
};
