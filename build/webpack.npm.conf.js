var merge = require('webpack-merge')
var config = require('../config')
var prodWebpackConfig = require('./webpack.prod.conf')

var webpackConfig = merge(prodWebpackConfig, {
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  }
});
webpackConfig.entry = {
  index: './src/components/port-graph.vue'
};

console.log(webpackConfig.entry);

module.exports = webpackConfig;
