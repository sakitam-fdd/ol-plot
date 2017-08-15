const webpack = require('webpack')
const env = require('yargs').argv.env
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
let devtool = false
if (config.dev.devtoolSourceMap && typeof config.dev.devtoolSourceMap === 'string') {
  devtool = config.dev.devtoolSourceMap
} else if (config.dev.devtoolSourceMap === true) {
  devtool = '#cheap-module-eval-source-map'
} else {
  devtool = false
}
module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap,
      extract: true
    })
  },
  devtool: devtool,
  watch: ((env === 'nowatch') ? false : (env !== 'nowatch')),
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /node_modules/
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env,
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrorsPlugin(),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/' + config.base.libraryName + '.css'),
      allChunks: true
    })
  ]
})
