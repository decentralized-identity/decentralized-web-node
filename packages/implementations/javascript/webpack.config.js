
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './main.mjs',
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'identity-hub.js',
    library: {
      type: 'module'
    }
  },
  resolve: {
    fallback: {
      'crypto': require.resolve('crypto-browserify'),
      'stream': require.resolve('stream-browserify')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  ]
};