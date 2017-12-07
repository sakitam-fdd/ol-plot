/* global __dirname, require, module */
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const autoprefixer = require('autoprefixer')
const webpack = require('webpack')
const externals = require('../config/ExternalModules')
const resolve = (dir) => {
  return path.join(__dirname, '..', dir)
}
module.exports = {
  entry: './src/index.js',
  output: {
    path: config.base.distDirectory,
    filename: config.base.fileName + (process.env.NODE_ENV === 'production' ? '.min.js' : '.js'),
    library: config.base.libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: [
    externals
  ],
  module: {
    rules: [
      {
        test: /(\.js)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('test')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src')]
      }
    ]
  },
  resolve: {
    extensions: ['.json', '.js', '.css', '.scss'],
    alias: {
      '@': resolve('src')
    }
  }
}
