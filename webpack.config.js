const path = require('path')
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
      {
        test: /.js$/, loader: 'babel-loader', options: {presets:['es2015','react']}
      }
    ]
  }
}