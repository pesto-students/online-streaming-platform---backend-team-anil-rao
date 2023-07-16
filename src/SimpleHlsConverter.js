const { Transcoder } = require('simple-hls');

const customRenditions = [
  {
      width: 640,
      height: 360,
      profile: 'main',
      hlsTime: '4',
      bv: '800k',
      maxrate: '856k',
      bufsize: '1200k',
      ba: '96k',
      ts_title: '360p',
      master_title: '360p'
  },
  // {
  //     width: 842,
  //     height: 480,
  //     profile: 'main',
  //     hlsTime: '4',
  //     bv: '1400k',
  //     maxrate: '1498',
  //     bufsize: '2100k',
  //     ba: '128k',
  //     ts_title: '480p',
  //     master_title: '480p'
  // },
  {
      width: 1280,
      height: 720,
      profile: 'main',
      hlsTime: '4',
      bv: '2800k',
      maxrate: '2996k',
      bufsize: '4200k',
      ba: '128k',
      ts_title: '720p',
      master_title: '720p'
  },
  {
      width: 1920,
      height: 1080,
      profile: 'main',
      hlsTime: '4',
      bv: '5000k',
      maxrate: '5350k',
      bufsize: '7500k',
      ba: '192k',
      ts_title: '1080p',
      master_title: '1080p'
  }
];


exports.transcodeVideoToHls = async (inputFilePath=`${__dirname}/videos/Video.mp4`,outputFilePath=`${__dirname}/video-render/`) =>
{
  return new Promise(async (resolve,reject) => {
    try {
      const t = new Transcoder(inputFilePath,outputFilePath, {renditions: customRenditions});
     const hlsPath = await t.transcode();
     console.log('Successfully Transcoded Video');
     resolve("success");
    } catch(e){
     console.log('Something went wrong',e);
     reject(e);
    }
  })
}
