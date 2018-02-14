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
const dstDir = path.join(__dirname, 'dist')
const uploader = multer({dest: tmpDir})

//access to static files
app.use('/pub', express.static(pubDir))
app.use('/dist', express.static(dstDir))
function getSettings (){
  if(!process.argv[2]){
    console.log("no config designated ! please enter proper settings !!\n\
     - node main.js postgresql://~(url)'\n\
     - node main.js [setting]\n\
     -------------------------\n\
     available settings are...\n")
    Object.keys(dbsettings).map((el) => {
      console.log(el)
    })
    process.exit()
  }else if (process.argv[2]){
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
  }else if(/^(postgresql:\/\/.*)$/.test(process.argv[2])){
    return process.argv[2].slice()
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

  })
})

app.get('/', (req,res) => {
  res.render('index.ejs')
})

/*
io.on("connection", (skt) => {
  skt.on('feature', (data)=> {})
})
*/

app.get('/admin', (req,res) => {
  fs.readFile('admin.html','utf8',(err,data)=>{
    res.send(data)
  })
})

//temporary token
const propertoken = "123456789authorized"

app.get('/admin/login',(req,res)=>{
  console.log('login attempt: ' + req.query.userid)
  //temporary admin id&pw
  if(req.query.userid === "admin" && req.query.userpw ==="1234"){
    res.json({token:propertoken})
  }
})

app.get('/admin/eventdetail',(req,res)=>{
  console.log('request event detail: ' + req.query.eventid)
  db.one('SELECT * FROM events WHERE eventid=$1;',req.query.eventid)
  .then((eventdata)=>{
    console.log("└", eventdata)
    res.json(eventdata)
  })
  .catch((err)=>{
    console.log(err)
    console.log('no data available, send over false data')
    //if there is no data available, send over an empty info
    res.json({
      eventid:req.query.eventid,
      title:"",
      brief:"",
      description:"",
      image:"",
      enabled:true,
      priority:1,
      link:"",
      shadecolor:""
    })
  })
})

app.get('/admin/dbreset',(req,res)=>{
  console.log('db reset attempt: ' + req.query.token)
  if(req.query.token === propertoken){
    db.task( t => {
      return t.none('DROP TABLE IF EXISTS events;') // this won't have any consequence if the table doesn't exist
      .then(()=>{
        return t.none('CREATE TABLE events (eventid serial not null primary key, datestart date,\
          dateend date, title varchar(20), brief varchar(40), description text, image varchar(40),\
          enabled bool, priority int, link varchar(100), shadecolor varchar(11));')
      })
    }).then(()=>{
      res.json({result:true})
    }).catch(err=>{
      res.json({result:false})
    })
  }else{
    res.json({result:false})
  }
})

process.on('unhandledRejection', r => console.log(r)); //error catcher