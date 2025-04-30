const baseConfig = require('./config.json');
const userConfig = require('./user_config.json');

const { merge } = require('lodash');

const config = merge({}, baseConfig || {}, userConfig || {});
module.exports = config;

