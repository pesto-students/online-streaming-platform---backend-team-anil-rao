const fs = require('fs');
var httpAttach = require('http-attach')
var hls = require('hls-server')
var http = require('http')
const express = require('express');
const mongoose = require("mongoose");
const branchName = require('current-git-branch');
var branch = branchName();

const app = require('express')();


const fileupload = require("express-fileupload");
app.use(fileupload());
app.use(express.static("files"));

mongoose.set('strictQuery', true);

mongoose.connect("mongodb+srv://chiragvaid88:chiragvaid88@cluster0.92liw3k.mongodb.net/online-streaming-service?retryWrites=true&w=majority");

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Connected to database");
});

db.on("error", (err) => {
  if (err) {
    console.log("Error in database connection" + err);
  }
});


const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { transcodeVideoToHls } = require('./SimpleHlsConverter');
const { localBuild } = require('./buildSetting');
const { datefunction } = require('./libs/dateGenerator');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
 
var server = http.createServer(app);

var baseDir = localBuild ? __dirname : '/home/spaces';
console.log("baseDir -----> " + baseDir);

function yourMiddleware (req, res, next) {
    // set your headers here
    res.setHeader('Access-Control-Allow-Origin', '*');
    next()
}

httpAttach(server, yourMiddleware)

server.listen(8002,() => {
    console.log("SLAVE SERVER STARTED ON PORT 7002")
})


fs.readdirSync(`${__dirname}/app/models`).forEach(function (file) {
  if (file.indexOf(".js") != -1)
    require(`${__dirname}/app/models/` + file);
});

const FileEntryModel = mongoose.model("fileEntry");

let serverIsBusy = false; 

app.get('/', (req, res) => {
    console.log("CALLED")
    return res.status(200).json({
      "message" : "Slave Server Activated"
    });
});

// app.post('/createUploadRequest', function (req, res) {
//     let fileName = req.body.fileName;
//     let date = datefunction();
//     if (!fs.existsSync(`${baseDir}/videos-input`))
//     {
//         fs.mkdirSync(`${baseDir}/videos-input`);
//     }
//     if (!fs.existsSync(`${baseDir}/videos-input/${date}-${fileName}`))
//     {
//         fs.mkdirSync(`${baseDir}/videos-input/${date}-${fileName}`);
//     }
//     if (!fs.existsSync(`${baseDir}/videos-output`))
//     {
//         fs.mkdirSync(`${baseDir}/videos-output`);
//     }
//     if (!fs.existsSync(`${baseDir}/videos-output/${date}-${fileName}`))
//     {
//         fs.mkdirSync(`${baseDir}/videos-output/${date}-${fileName}`);
//     }
//     const newModel = new FileEntryModel({
//         fileName: fileName,
//         fileEndpoint: `${date}-${fileName}`,
//         fileStatus:"uploading",
//         totalNumberOfChunks: 0,
//         fileGeneratedThroughChunks: false,
//         convertedToHls: false,
//         cDate: date,
//         uDate: date,
//         creationDate: new Date(),
//         active: true,
//         processingToHls: false
//     });

//     newModel.save(function (err, myResponse) {
//       if (err) {
//           console.log("ERROR WHILE createUploadRequest IN DATABASE IS -> ",err)
//           return;
//       } else {
//           console.log("NEW DOC IN createUploadRequest IS CREATED IN DATABASE -> ",myResponse)
//       }
//     });
//     res.status(200).json(
//         {
//             endPoint:`${date}-${fileName}`
//         }
//     );
// })
// app.post('/uploadUsingChunks', function (req, res) {
//     console.log(req.body.endPoint);
//     console.log(req.files.file.name);
//     console.log(req.files.file.data);
//     fs.writeFileSync(`${baseDir}/videos-input/${req.body.endPoint}/${req.files.file.name}`,req.files.file.data);
//     res.status(200).json( { } );
// })
// app.post('/enterTotalChunks', function (req, res) {
//     console.log(req.body.endPoint);
//     console.log(req.body.totalCount);
//     var dateis = datefunction();

//     const newModel = {
//         totalNumberOfChunks:req.body.totalCount,
//         fileStatus:"uploaded",
//         uDate: dateis,
//     };

//     FileEntryModel.findOneAndUpdate(
//       { fileEndpoint: req.body.endPoint },
//       newModel,
//       {
//         new: true,
//       },
//       function (err, myResponse) {
//         if (err) {
//             console.log("ERROR WHILE UPDATING RESPONSE IS -> ",err)
//           return;
//         } else {
//             console.log("UPDATE RESPONSE IS -> ",myResponse)
//         }
//       }
//     );
//     res.status(200).json( { } );
// })

app.post('/concatChunks', async function (req, res) {
    serverIsBusy = true;

    if (!fs.existsSync(`${baseDir}/videos-input`))
    {
        fs.mkdirSync(`${baseDir}/videos-input`);
    }
    if (!fs.existsSync(`${baseDir}/videos-input/${req.body.endPoint}`))
    {
        fs.mkdirSync(`${baseDir}/videos-input/${req.body.endPoint}`);
    }
    if (!fs.existsSync(`${__dirname}/videos-input`))
    {
        fs.mkdirSync(`${__dirname}/videos-input`);
    }
    if (!fs.existsSync(`${__dirname}/videos-input/${req.body.endPoint}`))
    {
        fs.mkdirSync(`${__dirname}/videos-input/${req.body.endPoint}`);
    }
    if (!fs.existsSync(`${baseDir}/videos-output`))
    {
        fs.mkdirSync(`${baseDir}/videos-output`);
    }
    if (!fs.existsSync(`${baseDir}/videos-output/${req.body.endPoint}`))
    {
        fs.mkdirSync(`${baseDir}/videos-output/${req.body.endPoint}`);
    }

    let newFile = await fs.createWriteStream(`${__dirname}/videos-input/${req.body.endPoint}/video.mp4`);

    if(!localBuild)
    {
        if (!fs.existsSync(`${__dirname}/videos-input`))
        {
            fs.mkdirSync(`${__dirname}/videos-input`);
        }
        if (!fs.existsSync(`${__dirname}/videos-input/${req.body.endPoint}`))
        {
            fs.mkdirSync(`${__dirname}/videos-input/${req.body.endPoint}`);
        }
    }

    for(let i=0;i<req.body.count;i++)
    {
        // await fs.createReadStream(`${baseDir}/dir/${i}.mp4`).pipe(newFile).on("end" )
        await new Promise(async (resolve) => {
            fs.readFile(`${baseDir}/videos-input/${req.body.endPoint}/${i}.mp4`,(err,data) => {
                console.log(`DATA FOR ${i} IS -> `,data)
                if(data == null || data == undefined)
                {
                    resolve();
                }
                newFile.write(data,(err) => {
                    if(err)
                    {
                        console.log("Error while Writing to file -> ",err)
                    }
                    resolve();
                });
            })
        })
    }

    if(!localBuild)
    {
        fs.copyFile(`${__dirname}/videos-input/${req.body.endPoint}/video.mp4`, `${baseDir}/videos-input/${req.body.endPoint}/video.mp4`, (error) => {
          if (error) {
            throw error
          } else {
            console.log('File has been moved to another folder.')
          }
          fs.unlink(`${__dirname}/videos-input/${req.body.endPoint}/video.mp4`,(err) => {
              if(err)
              {
                  console.log("ERROR WHILE DELETING FILE -> ",err);
              }
              console.log("FILE DELETED SUCCESSFULLY");
              fs.rmdir(`${__dirname}/videos-input/${req.body.endPoint}/`,(err) => {
                  if(err)
                  {
                      console.log("ERROR WHILE DELETING FILE -> ",err);
                  }
                  console.log("FILE DELETED SUCCESSFULLY");
              })
          })
        })
    }
    for(let i=0;i<req.body.count;i++)
    {
        await new Promise((resolve) => {
            fs.unlink(`${baseDir}/videos-input/${req.body.endPoint}/${i}.mp4`,(err) => {
                if(err)
                {
                    console.log("ERROR WHILE DELETING FILE -> ",err);
                    resolve();
                }
                console.log("FILE DELETED SUCCESSFULLY");
                resolve();
            })
        })
    }
    var dateis = datefunction();

    FileEntryModel.findOneAndUpdate(
      { fileEndpoint: req.body.endPoint },
      {
        fileGeneratedThroughChunks: true,
        uDate: dateis
      },
      {
        new: true,
      },
      function (err, myResponse) {
        if (err) {
            console.log("ERROR WHILE UPDATING RESPONSE IS -> ",err)
          return;
        } else {
            console.log("UPDATE RESPONSE IS -> ",myResponse)
        }
      }
    );

    serverIsBusy = false;

    res.sendStatus(200);
})
app.post('/transcodeExistingVideo', async function (req, res) {
    serverIsBusy = true;
    try{
        await new Promise((resolve) => {
          FileEntryModel.findOneAndUpdate(
            { fileEndpoint: req.body.endPoint },
            {
              processingToHls:true
            },
            {
              new: true,
            },
            function (err, myResponse) {
              if (err) {
                  console.log("ERROR WHILE UPDATING RESPONSE IS -> ",err)
                return;
              } else {
                  console.log("UPDATE RESPONSE IS -> ",myResponse)
              }
              resolve();
            }
          );
        })
        await transcodeVideoToHls(`${baseDir}/videos-input/${req.body.endPoint}/video.mp4`,`${baseDir}/videos-output/${req.body.endPoint}/`);
        var dateis = datefunction();

        const newModel = {
            convertedToHls:true,
            uDate: dateis,
        };
        FileEntryModel.findOneAndUpdate(
          { fileEndpoint: req.body.endPoint },
          newModel,
          {
            new: true,
          },
          function (err, myResponse) {
            if (err) {
                console.log("ERROR WHILE UPDATING RESPONSE IS -> ",err)
              return;
            } else {
                console.log("UPDATE RESPONSE IS -> ",myResponse)
            }
          }
        );
        res.sendStatus(200)
    }
    catch(error)
    {
        console.log("ERROR WHILE TRANSCODING -> ",error);
        await new Promise((resolve) => {
          FileEntryModel.findOneAndUpdate(
            { fileEndpoint: req.body.endPoint },
            {
              processingToHls:false
            },
            {
              new: true,
            },
            function (err, myResponse) {
              if (err) {
                  console.log("ERROR WHILE UPDATING RESPONSE IS -> ",err)
                return;
              } else {
                  console.log("UPDATE RESPONSE IS -> ",myResponse)
              }
              resolve();
            }
          );
        })
        res.sendStatus(400);
    }
    serverIsBusy = false;
})

app.post('/getSlaveServerStatus', async function (req, res) {
  console.log("GET SLAVE SERVER STATUS CALLED!!")
  res.status(200).json({
    serverStatus: serverIsBusy
  })
})

app.post('/setSlaveServerStatus', async function (req, res) {
  console.log("SET SLAVE SERVER STATUS CALLED!!",req.body.serverStatus)
  serverIsBusy = req.body.serverStatus;
  res.status(200).json({
    serverStatus: serverIsBusy
  })
})
