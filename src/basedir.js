const { localBuild } = require("./buildSetting");

module.exports.baseDir = localBuild ? __dirname : '/home/spaces';


module.exports.dirname =  __dirname;