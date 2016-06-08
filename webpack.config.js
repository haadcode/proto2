'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    filename: './dist/bundle.js'
  },
  cache: false,
  debug: true,
  devtool: 'sourcemap',
  node: {
    console: false,
    process: 'mock',
    Buffer: 'buffer'
  },
  stats: {
    colors: true,
    reasons: true
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  resolve: {
    // extensions: ['', '.js', '.jsx'],
    modulesDirectories: [
      'node_modules',
      path.join(__dirname, 'node_modules')
    ],
    alias: {
      "libp2p-ipfs": "libp2p-ipfs-browser",
      'node_modules': path.join(__dirname + '/node_modules'),
      'app': __dirname + '/src/app/',
      'styles': __dirname + '/src/styles',
      'mixins': __dirname + '/src/mixins',
      'components': __dirname + '/src/components/',
      'stores': __dirname + '/src/stores/',
      'actions': __dirname + '/src/actions/',
      'utils': __dirname + '/src/utils/'
    }
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel'
    }, {
      test: /\.js$/,
      include: /node_modules\/(hoek|qs|wreck|boom|ipfs-.+)/,
      loader: 'babel'
    }, {
      test: /\.scss/,
      loader: 'style-loader!css-loader!sass-loader?outputStyle=expanded'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|jpg|woff|woff2)$/,
      loader: 'url-loader?limit=8192'
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  externals: {
    net: '{}',
    tls: '{}',
    fs: '{}',
    'require-dir': '{}',
    mkdirp: '{}'
  }
};
