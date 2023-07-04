const express = require("express");
const mongoose = require("mongoose");
var cron = require("node-cron");
const mainRouter = express.Router();
// const CourseContentDataModel = mongoose.model("CourseContentData");
const FileEntryModel = mongoose.model("fileEntry");
const ServerStatusModel = mongoose.model("ServerStatus");
var dateGenerator = require("../../libs/dateGenerator");
const { localBuild } = require("../../buildSetting");
const { transcodeVideoToHls } = require("../../SimpleHlsConverter");
const { baseDir, dirname } = require("../../basedir");
const fs = require('fs');
const { resolve } = require("path");

module.exports.controllerFunction = function (app) {

  // cron.schedule('0,5,10,15,20,25,30,35,40,45,50,55 * * * *',async () => {
  //   console.log("CRONJOB CALLLED !!");
  //   let availableServer = [];
  //   await new Promise((resolve) => {
  //     ServerStatusModel.find({active: true},async (err,response) => {
  //       if(err)
  //       {
  //         console.log("ERROR WHILE GETTING ACTIVE SERVERS DATA !! ",err)
  //         resolve();
  //       }
  //       else
  //       {
  //         if(response.length == 0)
  //         {
  //           resolve()
  //         }
  //         for(let i=0;i<response.length;i++)
  //         {
  //           let result = await new Promise((resolve) => {
  //             var axios = require('axios');
  //             var FormData = require('form-data');
  //             var data = new FormData();
  //             data.append('page', '1');
  //             data.append('limit', '1000');

  //             var config = {
  //               method: 'post',
  //               url: `${response[i].serverLink}getSlaveServerStatus`,
  //               headers: { 
  //                 ...data.getHeaders()
  //               },
  //               data : data
  //             };

  //             axios(config)
  //             .then(function (response) {
  //               console.log(JSON.stringify(response.data));
  //               resolve(response.data.serverStatus)
  //             })
  //             .catch(function (error) {
  //               console.log(error);
  //               resolve(true)
  //             });
  //           })
  //           if(result == false)
  //           {
  //             if(response[i]?.assignedFileEndpoint != "")
  //             {
  //               if(response[i]?.assignedFileTask == "concatChunks")
  //               {

  //                 let result = await new Promise((resolve) => {
  //                   FileEntryModel.find({fileEndpoint: response[i].assignedFileEndpoint},(err,fileResponse) => {
  //                     if(err)
  //                     {
  //                       console.log("ERROR WHILE FETCHING FILE DATA -> ",err)
  //                       resolve(false);
  //                     }
  //                     else
  //                     {
  //                       if(fileResponse.length > 0)
  //                       {
  //                         if(fileResponse[0].fileGeneratedThroughChunks == true)
  //                         {
  //                           resolve(true);
  //                         }
  //                         else
  //                         {
  //                           var axios = require('axios');
  //                           var FormData = require('form-data');
  //                           var data = new FormData();
  //                           data.append('endPoint', response[i].assignedFileEndpoint);
  //                           data.append('count', fileResponse[0].totalNumberOfChunks);

  //                           var config = {
  //                             method: 'post',
  //                             url: `${response[i].serverLink}concatChunks`,
  //                             headers: { 
  //                               ...data.getHeaders()
  //                             },
  //                             data : data
  //                           };
                          
  //                           axios(config)
  //                           .then(function (response) {
  //                             console.log(JSON.stringify(response.data));
  //                           })
  //                           .catch(function (error) {
  //                             console.log(error);
  //                           });
  //                           resolve(false);
  //                         }
  //                       }
  //                       else 
  //                       {
  //                         resolve(true);
  //                       }
  //                     }
  //                   })
  //                 })

  //                 if(result)
  //                 {
  //                   availableServer.push(response[i])
  //                 }

  //               }
  //               else if(response[i]?.assignedFileTask == "convertToHls")
  //               {

  //                 let result = await new Promise((resolve) => {
  //                   FileEntryModel.find({fileEndpoint: response[i].assignedFileEndpoint},(err,fileResponse) => {
  //                     if(err)
  //                     {
  //                       console.log("ERROR WHILE FETCHING FILE DATA -> ",err)
  //                       resolve(false);
  //                     }
  //                     else
  //                     {
  //                       if(fileResponse.length > 0)
  //                       {
  //                         if(fileResponse[0].convertedToHls == true)
  //                           resolve(true);
  //                         else
  //                         {
  //                           var axios = require('axios');
  //                           var FormData = require('form-data');
  //                           var data = new FormData();
  //                           data.append('endPoint', response[i].assignedFileEndpoint);

  //                           var config = {
  //                             method: 'post',
  //                             url: `${response[i].serverLink}transcodeExistingVideo`,
  //                             headers: { 
  //                               ...data.getHeaders()
  //                             },
  //                             data : data
  //                           };
                          
  //                           axios(config)
  //                           .then(function (response) {
  //                             console.log(JSON.stringify(response.data));
  //                           })
  //                           .catch(function (error) {
  //                             console.log(error);
  //                           });

  //                           resolve(false)
  //                         }
  //                       }
  //                       else 
  //                       {
  //                         resolve(true);
  //                       }
  //                     }
  //                   })
  //                 })
  //                 if(result)
  //                 {
  //                   availableServer.push(response[i])
  //                 }

  //               }
  //               else
  //                 availableServer.push(response[i])
  //             }
  //             else
  //               availableServer.push(response[i])
  //           }
  //           if(i == response.length-1)
  //           {
  //             resolve()
  //           }
  //         }
  //       }
  //     })
  //   })

  //   // IF A VIDEO FILE IN NOT TRANSCODED IN 24HOURS BECAUSE SERVER WENT DOWN
  //   // await new promises((resolve) => {
  //   //   FileEntryModel.find({processingToHls: true,convertedToHls:false} ,async (err,response) => {
  //   //     if(err)
  //   //     {
  //   //       console.log("ERROR WHILE FETCHING DATA IN CRONJOB FOR PROCESSING  -> ",err)
  //   //       return;
  //   //     }
  //   //     if(response.length > 0)
  //   //     {
  //   //       for(let i=0;i<response.length;i++)
  //   //       {
  //   //         if( response[i].uDate > 0 )
  //   //         {
  //   //         }
  //   //         else
  //   //         {
  //   //           resolve();
  //   //         }
  //   //         if(i == response.length-1)
  //   //           resolve()
  //   //       }
  //   //     }
  //   //     else
  //   //     {
  //   //       resolve();
  //   //     }
  //   //   })
  //   // })

  //   console.log("AVAILABLE SERVER DATA ARE -> ",availableServer)
  //   if(availableServer.length > 0)
  //   {
  //     await new Promise((resolve) => {
  //       FileEntryModel.find({fileGeneratedThroughChunks:false,fileStatus: "uploaded"} ,async (err,response) => {
  //         if(err)
  //         {
  //           console.log("ERROR WHILE FETCHING DATA IN CRONJOB FOR PROCESSING  -> ",err);
  //           resolve();
  //           return;
  //         }
  //         if(response.length > 0 && availableServer.length > 0)
  //         {
  //           for(let i=0;i<response.length;i++)
  //           {
  //             if( availableServer.length > 0 )
  //             {
  //               let serverData = availableServer.pop();
  //               ServerStatusModel.findOneAndUpdate({_id : serverData._id},{
  //                 assignedFileEndpoint: response[i].fileEndpoint,
  //                 assignedFileTask: "concatChunks"
  //               },{new:true},(err,response) => {
  //                 if(err)
  //                 {
  //                   console.log("ERROR WHILE UPDATING SERVER DATA  -> ",err)
  //                 }
  //                 else
  //                 {
  //                   console.log("SERVER DATA UPDATED -> ",response)
  //                 }
  //               })
  //               console.log(`CONCAT VIDEO CALLED WITH SERVER LINK ${serverData.serverLink} & VIDEO DATA AS -> `,response[i])
  //               var axios = require('axios');
  //               var FormData = require('form-data');
  //               var data = new FormData();
  //               data.append('endPoint', response[i].fileEndpoint);
  //               data.append('count', response[i].totalNumberOfChunks);
      
  //               var config = {
  //                 method: 'post',
  //                 url: `${serverData.serverLink}concatChunks`,
  //                 headers: { 
  //                   ...data.getHeaders()
  //                 },
  //                 data : data
  //               };
      
  //               axios(config)
  //               .then(function (response) {
  //                 console.log(JSON.stringify(response.data));
  //               })
  //               .catch(function (error) {
  //                 console.log(error);
  //               });
  //             }
  //             else
  //             {
  //               resolve();
  //             }
  //             if(i == response.length-1)
  //               resolve()
  //           }
  //         }
  //         else
  //         {
  //           resolve();
  //         }
  //       })
  //     })
  //     FileEntryModel.find({convertedToHls: false,processingToHls: false,fileGeneratedThroughChunks:true} ,async (err,response) => {
  //       if(err)
  //       {
  //         console.log("ERROR WHILE FETCHING DATA IN CRONJOB FOR PROCESSING  -> ",err)
  //         return;
  //       }
  //       if(response.length > 0 && availableServer.length > 0)
  //       {
  //         for(let i=0;i<response.length;i++)
  //         {
  //           if( availableServer.length > 0 )
  //           {
  //             let serverData = availableServer.pop();
  //             console.log(`TRANSCODE VIDEO CALLED WITH SERVER LINK ${serverData.serverLink} & VIDEO DATA AS -> `,response[i])
  //             ServerStatusModel.findOneAndUpdate({_id : serverData._id},{
  //               assignedFileEndpoint: response[i].fileEndpoint,
  //               assignedFileTask: "convertToHls"
  //             },{new:true},(err,response) => {
  //               if(err)
  //               {
  //                 console.log("ERROR WHILE UPDATING SERVER DATA  -> ",err)
  //               }
  //               else
  //               {
  //                 console.log("SERVER DATA UPDATED -> ",response)
  //               }
  //             })
  //             var axios = require('axios');
  //             var FormData = require('form-data');
  //             var data = new FormData();
  //             data.append('endPoint', response[i].fileEndpoint);
    
  //             var config = {
  //               method: 'post',
  //               url: `${serverData.serverLink}transcodeExistingVideo`,
  //               headers: { 
  //                 ...data.getHeaders()
  //               },
  //               data : data
  //             };
    
  //             axios(config)
  //             .then(function (response) {
  //               console.log(JSON.stringify(response.data));
  //             })
  //             .catch(function (error) {
  //               console.log(error);
  //             });
  //           }
  //           else
  //           {
  //             resolve();
  //           }
  //           if(i == response.length-1)
  //             resolve()
  //         }
  //       }
  //       else
  //       {
  //         resolve();
  //       }
  //     })
  //   }
  //   else 
  //   {
  //     console.log("ALL SLAVE SERVERS ARE BUSY AT THIS MOMENT!!")
  //   }
  // })

  app.use("/v1/cronjob", mainRouter);
};
