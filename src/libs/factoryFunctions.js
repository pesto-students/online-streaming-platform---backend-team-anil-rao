var middleWares = require("../middlewares/token");
const APIFeatures = require("./apiFeatures");
const { sendRes } = require("./resJson");
// const aws = require("aws-sdk");

exports.countDoc = (mainModel, res,condition={}) => {
  mainModel.countDocuments({...condition},function (err, response) {
    if (err) {
      sendRes(true, 500, null, err, 0, res);
      return;
    } else {
      const data = {
        totalElements: response,
      };
      sendRes(false, 200, data, "Request Successfully Served!", 1, res);
    }
  });
};

// exports.fileUpload = (fileType, buffer, extension) => {
//   const spacesEndpoint = new aws.Endpoint("sgp1.digitaloceanspaces.com");
//     const s3 = new aws.S3({
//       endpoint: spacesEndpoint,
//       region: "sgp1",
//       accessKeyId: "DO0028MX7EZRBMJQNL7V",
//       secretAccessKey: "NvNsHdZjRQAPKwF3MwHz6yF6pM4og4OrNEIANarBsoQ",
//     });
    
//     const key = fileType + String(Date.now()) + "." + extension;

//     const data = {
//       Bucket: "competishun",
//       Key: key,
//       Body: buffer,
//       ACL: "public-read",
//       ContentType: `${fileType}/${extension}`,
//     };

//     s3.putObject(data, function (err, data) {
//       if (err) {
//         console.log(err);
//         console.log("Error uploading data: ", data);
//       } else {
//         // res.send("https://competishun.sgp1.digitaloceanspaces.com/" + key);
//         return `https://competishun.sgp1.digitaloceanspaces.com/ + ${key}`;
//       }
//     });
// }