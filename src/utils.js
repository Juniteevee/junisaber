const BASE_URL = 'https://saber.supermedium.com';

const BeatSaverAPI = require('beatsaver-api');
const api = new BeatSaverAPI({
  AppName: 'Application Name',
  Version: '1.0.0'
});

function getS3FileUrl (id, name) {
  return `${BASE_URL}/${id}-${name}?v=1`;
}

module.exports.getS3FileUrl = getS3FileUrl;
