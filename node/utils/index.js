const diffRoms = require('./diffRoms');
const utils = require('./utils');
const theTwinsEffect = require('./the-twins-effect');

module.exports = {
  ...diffRoms,
  ...utils,
  ...theTwinsEffect,
}
