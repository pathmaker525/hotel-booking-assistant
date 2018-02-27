const path = require('path')
const webpack = require('webpack')
module.exports = {
  entry: path.join(__dirname,'src/admin.js'),
  output: {
    //this equals to __dirname + '/dist'
    path: path.join(__dirname,'dist'),
    filename:'bundle.js'
  },
  devtool:'inline-source-map',
  module:{
    rules:[
      {  test: /\.js$/, loader: 'babel-loader', options: {presets:['es2015','react']}  },
      {test: /\.css$/, loader:'style-loader'},
      { test: /\.css$/, loader: 'css-loader' ,options:{modules:true,localIdentName: "[name]__[local]___[hash:base64:5]" }}
    ]
  }
  ,plugins: [
    new webpack.DefinePlugin({ //<--key to reduce React's size
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    //new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
  ]
}