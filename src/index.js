const fs = require('fs');
var httpAttach = require('http-attach')
var hls = require('hls-server')
var http = require('http')
const express = require('express');
const mongoose = require("mongoose");
const branchName = require('current-git-branch');
var branch = branchName();

// var HttpStatus = require('http-status-codes');
// var morgan = require('morgan');
// var path = require('path');
// var Busboy = require('busboy');

const app = require('express')();

// app.use(morgan('combined'))


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

new hls(server, {
    provider: {
        exists: (req, cb) => {
            console.log("REQUEST.URL -> "+req.url)

            const ext = req.url.split('.').pop();

            if (ext !== 'm3u8' && ext !== 'ts') {
                return cb(null, true);
            }

            fs.access(baseDir + req.url, fs.constants.F_OK, function (err) {
                if (err) {
                    console.log('File not exist');
                    return cb(null, false);
                }
                cb(null, true);
            });

        },
        getManifestStream: (req, cb) => {
            const stream = fs.createReadStream(baseDir + req.url);
            cb(null, stream);
        },
        getSegmentStream: (req, cb) => {
            const stream = fs.createReadStream(baseDir + req.url);
            cb(null, stream);
        }
    }
});

function yourMiddleware (req, res, next) {
    // set your headers here
    res.setHeader('Access-Control-Allow-Origin', '*');
    next()
}
httpAttach(server, yourMiddleware)

server.listen(8001,() => {
    console.log("SERVER STARTED ON PORT 8001")
})


fs.readdirSync(`${__dirname}/app/models`).forEach(function (file) {
  if (file.indexOf(".js") != -1)
    require(`${__dirname}/app/models/` + file);
});

fs.readdirSync(`${__dirname}/app/controllers`).forEach(function (file) {
  if (file.indexOf(".js") != -1) {
    var route = require(`${__dirname}/app/controllers/` + file);
    route.controllerFunction(app);
  }
});

const FileEntryModel = mongoose.model("fileEntry");

app.get('/', (req, res) => {
    console.log("CALLED")
    return res.status(200).sendFile(`${__dirname}/client.html`);
});

app.post("/getHlsVideo", async function (req, res) {
    let fileName = req.files.video.name;
    let date = datefunction();

    if (!fs.existsSync(`${baseDir}/videos-input`))
    {
        fs.mkdirSync(`${baseDir}/videos-input`);
    }

    if (!fs.existsSync(`${baseDir}/videos-output`))
    {
        fs.mkdirSync(`${baseDir}/videos-output`);
    }

    if (!fs.existsSync(`${baseDir}/videos-input/${date}-${fileName}`))
    {
        fs.mkdirSync(`${baseDir}/videos-input/${date}-${fileName}`);
    }

    if (!fs.existsSync(`${baseDir}/videos-output/${date}-${fileName}`))
    {
        fs.mkdirSync(`${baseDir}/videos-output/${date}-${fileName}`);
    }

    fs.writeFileSync(`${baseDir}/videos-input/${date}-${fileName}/video.mp4`,req.files.video.data);

    // ffmpeg(`Videos/${fileName}/video.mp4`, { timeout: 432000 }).addOptions([
    //     '-profile:v baseline',
    //     '-level 3.0',
    //     // '-s 640x360 ',
    //     '-start_number 0',
    //     '-hls_time 2',
    //     '-hls_list_size 0',
    //     '-f hls'
    // ]).output(`Videos/${fileName}/output.m3u8`).on('end', () => {
    //     console.log('end');
    // }).run();

    try{
        await transcodeVideoToHls(`${baseDir}/videos-input/${date}-${fileName}/video.mp4`,`${baseDir}/videos-output/${date}-${fileName}/`);
        res.sendStatus(200)
    }
    catch(error)
    {
        console.log("ERROR WHILE TRANSCODING -> ",error)
        res.sendStatus(400);
    }
});

app.post("/getDifferentResolutions", function (req, res) {
    let fileName = req.files.video.name;
    // if (!fs.existsSync(`videos/${fileName}/video_output`)) 
    //     fs.mkdirSync(`videos/${fileName}/video_output`);
    if (!fs.existsSync(`videos/${fileName}`)) 
        fs.mkdirSync(`videos/${fileName}`);
    // if (!fs.existsSync(`videos/${fileName}/video_output/360`)) 
    //     fs.mkdirSync(`videos/${fileName}/video_output/360`);
    // if (!fs.existsSync(`videos/${fileName}/video_output/720`)) 
    //     fs.mkdirSync(`videos/${fileName}/video_output/720`);
    // if (!fs.existsSync(`videos/${fileName}/video_output/1080`)) 
    //     fs.mkdirSync(`videos/${fileName}/video_output/1080`);
    ffmpeg(`videos/${fileName}/video.mp4`)
        // .setStartTime(i)
        // .setDuration(`${setChunkDuration}`)

        .output(`videos/${fileName}/360.mp4`)
        .videoCodec('libx264')  
        .size('480x360')

        .output(`videos/${fileName}/720.mp4`)
        .videoCodec('libx264')  
        .size('1280x720')

        .output(`videos/${fileName}/1080.mp4`)
        .videoCodec('libx264')
        .size('1920x1080')
        .on('end', function(err) {
            console.log("INSIDE END")
            if(!err) 
            { 
                console.log('conversion Done');
                res.status(200).send("Converted to different resolutions")
            }
        }) 
        .on('error', err => 
            {
                console.log('error: ', err);
            })
        .run();
})

app.post('/createUploadRequest', function (req, res) {
    let fileName = req.body.fileName;
    let date = datefunction();
    if (!fs.existsSync(`${baseDir}/videos-input`))
    {
        fs.mkdirSync(`${baseDir}/videos-input`);
    }
    if (!fs.existsSync(`${baseDir}/videos-input/${date}-${fileName}`))
    {
        fs.mkdirSync(`${baseDir}/videos-input/${date}-${fileName}`);
    }
    if (!fs.existsSync(`${baseDir}/videos-output`))
    {
        fs.mkdirSync(`${baseDir}/videos-output`);
    }
    if (!fs.existsSync(`${baseDir}/videos-output/${date}-${fileName}`))
    {
        fs.mkdirSync(`${baseDir}/videos-output/${date}-${fileName}`);
    }
    const newModel = new FileEntryModel({
        fileName: fileName,
        fileEndpoint: `${date}-${fileName}`,
        fileStatus:"uploading",
        totalNumberOfChunks: 0,
        fileGeneratedThroughChunks: false,
        convertedToHls: false,
        cDate: date,
        uDate: date,
        creationDate: new Date(),
        active: true,
        processingToHls: false
    });

    newModel.save(function (err, myResponse) {
      if (err) {
          console.log("ERROR WHILE createUploadRequest IN DATABASE IS -> ",err)
          return;
      } else {
          console.log("NEW DOC IN createUploadRequest IS CREATED IN DATABASE -> ",myResponse)
      }
    });
    res.status(200).json(
        {
            endPoint:`${date}-${fileName}`
        }
    );
})
app.post('/uploadUsingChunks', function (req, res) {
    console.log(req.body.endPoint);
    console.log(req.files.file.name);
    console.log(req.files.file.data);
    fs.writeFileSync(`${baseDir}/videos-input/${req.body.endPoint}/${req.files.file.name}`,req.files.file.data);
    // fs.writeFileSync(`${baseDir}/dir/${req.files.file.name}`,req.files.file.data);
    res.status(200).json( { } );
})

app.post('/enterTotalChunks', function (req, res) {
    console.log(req.body.endPoint);
    console.log(req.body.totalCount);
    // fs.writeFileSync(`${baseDir}/videos-input/${req.body.endPoint}/totalCount.txt`,req.body.totalCount);
    // fs.writeFileSync(`${baseDir}/dir/${req.files.file.name}`,req.files.file.data);
    var dateis = datefunction();

    const newModel = {
        totalNumberOfChunks:req.body.totalCount,
        fileStatus:"uploaded",
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
    res.status(200).json( { } );
})
app.post('/concatChunks', async function (req, res) {

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
        // await fs.createReadStream(`${baseDir}/dir/${i}.mp4`).pipe(newFile).on("end" )
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

    // fs.readFile(`${baseDir}/dir/concat-file/video.mp4`,(err,data) => {
    //     console.log(`DATA FOR IS -> `,data);
    // })
    // fs.readFile(`${baseDir}/videos-input/20230516172222-HlsMp4TestFile.mp4/video.mp4`,(err,data) => {
    //     console.log(`DATA FOR IS -> `,data);
    // })


    // await new Promise((resolve) => {
    //     fs.createReadStream(`${baseDir}/dir/1.mp4`).pipe(newFile).on("finish" ,() => {
    //         resolve();
    //     })
    // })
    
    // fs.readdirSync(`${baseDir}/dir`).forEach(async function (file) {
    //   if (file.indexOf(".mp4"))
    //   {
    //     console.log(file);
    //     // newFile.write(fs.readFileSync(file))
    //     // fs.createReadStream(`${baseDir}/dir/${file}`).pipe(newFile)
    //   }
    // });
    var dateis = datefunction();

    const newModel = {
        fileGeneratedThroughChunks:true,
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
    res.sendStatus(200);
})


app.post('/transcodeExistingVideo', async function (req, res) {
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
        console.log("ERROR WHILE TRANSCODING -> ",error)
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
})

app.post('/testWrite', async function (req, res) {
    let newFile = await fs.createWriteStream(`${baseDir}/dir/concat-file/test.txt`);
    newFile.write("Chirag ");
    newFile.write("Vaid ");
    res.sendStatus(200);
})