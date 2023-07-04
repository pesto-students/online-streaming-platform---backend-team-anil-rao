// import AWS from "aws-sdk";
// const spacesEndpoint = new AWS.Endpoint("sgp1.digitaloceanspaces.com");
// const s3 = new AWS.S3({
//   endpoint: spacesEndpoint,
//   accessKeyId: "DO00KF6HTN4PV6LUEHDJ",
//   secretAccessKey: "tdyI4UwnTR7vl6XzbW2zJaI1E7qwLeIGxMwPKAD1gGk",
//   httpOptions: {
//     timeout: 12000000000,
//   },
// });

// export const digitaloceanLargeFile = (blob) => {
//   return new Promise((resolve, reject) => {
//     const exten = blob.type.split("/");
//     const key = String(Date.now()) + "." + exten[exten.length - 1];
//     const params = {
//       Body: blob,
//       Bucket: "competishundashboard",
//       Key: key,
//     };
//     s3.putObject(params)
//       .on("build", (request) => {
//         request.httpRequest.headers.Host = `https://competishundashboard.sgp1.digitaloceanspaces.com`;
//         request.httpRequest.headers["Content-Length"] = blob.size;
//         request.httpRequest.headers["Content-Type"] = blob.type;
//         request.httpRequest.headers["x-amz-acl"] = "public-read";
//       })
//       .send((err) => {
//         if (err) {
//             reject(err)
//         } else {
//           const link = `https://competishundashboard.sgp1.digitaloceanspaces.com/${key}`;
//           resolve(link)
//         }
//       });
//   });
// };