const { getAudioDurationInSeconds } = require('get-audio-duration')
exports.getAudioDurationInSeconds=async (audioUrl)=>{
    const duration= await getAudioDurationInSeconds(audioUrl)
  return Math.ceil(duration)
}