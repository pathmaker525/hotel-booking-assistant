// high priority - must used
const fs = require('fs')
const express = require('express') // divide app and express part so that I can use express contstants
const app = express()
const http = require('http').Server(app)
const bodyParser = require('body-parser')
const moment = require('moment')

// advanced priority(view engine, db) - interchangable
const ejs = require('ejs')
app.set("view engine", "ejs")
const pgp = require('pg-promise')( /* Initialization Options */ )
const dbsettings = require("./appsettings.js")

// low priority - not really sure if it will be used
const io = require('socket.io')(http)
const bcrypt = require('bcrypt')
const uuid = require('uuid/v4')

const multer = require('multer')
const path = require('path')
const tmpDir = path.join(__dirname,'tmp')
const pubDir = path.join(__dirname, 'pub')
const uploader = multer({dest: tmpDir})


//access to static files
app.use('/pub', express.static(pubDir));

function getSettings (){
  if(!process.argv[2]){
    console.log("config has not set up! please enter proper settings - node main.js [setting]\navailable settings are...\n")
    Object.keys(dbsettings).map((el) => {
      console.log(el)
    })
    process.exit()
  }else{
    let result = {}
    Object.keys(dbsettings).map((el) => {
      if(el === process.argv[2]){
        if(dbsettings[el] instanceof Object){
          //if setting is an object
          result = Object.assign(dbsettings[el])
        }else{
          //if setting is a string
          result = dbsettings[el]
        }
      }
    })
    return result
  }
}

const pgconfig = getSettings()
console.log("try logging in with the info below :")
console.log(pgconfig)
/* connection is auto-configured from npm library, it isn't necessary */
const db = pgp(pgconfig)

/* initialize bodyparser to build up RESTful app */
app.use(bodyParser.urlencoded({ extended:false}))
app.use(bodyParser.json())
  
http.listen(process.env.PORT || 3000, function(){
  console.log("server is up at " + this.address().port)
})


function getIP(req){
  const ip = req.headers['x-forwarded-for'] || 
  req.connection.remoteAddress || 
  req.socket.remoteAddress ||
  (req.connection.socket ? req.connection.socket.remoteAddress : null)
  return ip
}

app.get('/eventJSON', (req,res) => {
  db.any('SELECT * FROM events WHERE datestart <= CURRENT_DATE AND dateend >= CURRENT_DATE\
    AND enabled = true ORDER BY priority;')
  .then((sqldata)=>{
    res.send(sqldata)
  })
  .catch((err)=>{

  });
})

app.get('/', (req,res) => {
  res.render('index.ejs')
})

/*
io.on("connection", (skt) => {
  skt.on('feature', (data)=> {})
})
*/

app.get('/adminJSON', (req,res) => {

})
app.get('/admin', (req,res) => {
  
})


process.on('unhandledRejection', r => console.log(r)); //error catcher