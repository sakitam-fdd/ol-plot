/* global __dirname, require, module */
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const autoprefixer = require('autoprefixer')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const resolve = (dir) => {
  return path.join(__dirname, '..', dir)
}
module.exports = {
  entry: './src/index.js',
  output: {
    path: config.base.distDirectory,
    filename: config.base.libraryName + (process.env.NODE_ENV === 'production' ? '.min.js' : '.js'),
    library: config.base.libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: {
    ol: 'openlayers'
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
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
        include: [resolve('src'), resolve('test'), resolve('node_modules')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  resolve: {
    extensions: ['.json', '.js', '.css', '.scss'],
    alias: {
      '@': resolve('src')
    }
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: function () {
          return [
            autoprefixer({
              browsers: ['ie>=8', '>1% in CN']
            })
          ]
        }
      }
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../asset'),
        to: config.base.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
}
