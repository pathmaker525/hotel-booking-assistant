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


//originally '/eventJSON' renamed to 'queryJSON'
app.get('/queryJSON', (req,res) => {
  if(req.query.type === "event"){
    let querystring = 'SELECT eventid, title, datestart, dateend, priority, enabled FROM events'
    if (req.query.showall === "false") {querystring += ' WHERE enabled = true AND datestart <= CURRENT_DATE AND dateend >= CURRENT_DATE'}
    querystring += ' ORDER BY priority;'

    db.any(querystring)
    .then((sqldata)=>{
      res.json({queryevent:sqldata})
    })
    .catch((err)=>{
      console.log(err)
    })
  }else if(req.query.type === "desc"){
    db.any('SELECT * FROM descs;')
    .then((sqldata)=>{
      res.json({querydesc:sqldata})
    })
    .catch((err)=>{
      console.log(err)
    })
  }else if(req.query.type === "eventdetail"){
    db.one('SELECT * FROM events WHERE eventid = $1;', req.query.targetid)
    .then((sqldata)=>{
      res.json({queryeventdetail:sqldata})
    })
    .catch((err)=>{
      console.log(err)
    })
  }else if(req.query.type === "descdetail"){
    let searchtarget = 'descid'
    let searchtarget2 = req.query.targetid
    if(req.query.targetname){
      searchtarget = 'title'
      searchtarget2 = req.query.targetname
    }
    db.one('SELECT * FROM descs WHERE ' + searchtarget +' = $1;', searchtarget2)
    .then((sqldata)=>{
      res.json({querydescdetail:sqldata})
    })
    .catch((err)=>{
      console.log(err)
    })
  }else if(req.query.type === "eventlastid"){
    db.one('SELECT max(eventid) as lastid FROM events;')
    .then((sqldata)=>{
      res.json({querylastid:sqldata.lastid})
    })
    .catch((err)=>{
      console.log(err)
    })
  }else if(req.query.type === "eventmain"){
    //TODO : send over data to main page ejs file
    db.any('SELECT * FROM events WHERE enabled = true AND datestart <= CURRENT_DATE AND dateend >= CURRENT_DATE;')
    .then((sqldata)=>{
      res.json(sqldata)
    })
    .catch((err)=>{
      console.log(err)
    })
  }
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

function validateToken (targetToken) {
  if(targetToken === propertoken){
    return true
  }else{
    return false
  }
}

app.get('/admin/login',(req,res)=>{
  console.log('login attempt: ' + req.query.userid)
  //temporary admin id&pw
  if(req.query.userid === "admin" && req.query.userpw ==="1234"){
    res.json({token:propertoken})
  }
})

app.get('/admin/dbreset',(req,res)=>{
  console.log('db reset attempt: ' + req.query.token)
  if(validateToken(req.query.token)){
    db.tx(t1 => {
      return this.batch([
        t1.none('DROP TABLE IF EXISTS events;'),
        t1.none('DROP TABLE IF EXISTS descriptions;'),
        t1.tx(t2=>{
          return this.batch([

            t2.none('CREATE TABLE events (eventid serial not null primary key,\
              datestart date,\
              dateend date,\
              title varchar(20),\
              brief varchar(40),\
              description text,\
              image varchar(40),\
              enabled bool,\
              priority int,\
              link varchar(100));'),

            t2.none('CREATE TABLE descs (descid serial not null primary key,\
              title varchar(100),\
              context text,\
              dateedit date);')
          ])
        })
      ])
    }).then(()=>{
      res.json({result:true})
    }).catch(err=>{
      console.log(err)
      res.json({result:false})
    })
  }
  /*
  if(validateToken(propertoken)){
    db.task( t => {
      return t.none('DROP TABLE IF EXISTS events;DROP TABLE IF EXISTS descriptions;') // this won't have any consequence if the table doesn't exist
      .then(()=>{
        return t.none('CREATE TABLE events (eventid serial not null primary key, datestart date,\
          dateend date, title varchar(20), brief varchar(40), description text, image varchar(40),\
          enabled bool, priority int, link varchar(100));')
      })
    }).then(()=>{
      res.json({result:true})
    }).catch(err=>{
      res.json({result:false})
    })
  }else{
    res.json({result:false})
  }*/
})

app.post('/postimage',(req,res)=>{
  uploader.single(req.query.file)
  if(req.file.mimetype == 'image/png' || req.file.mimetype =='image/jpeg'){
    res.json({result:true})
  }else{
    res.json({result:false})
  }
})

//change every upload to 'post' --> query is not safe for transaction
//return status 204 after finishing the action so that the browser doesn't hang
app.get('/modifydata',(req,res)=>{
  if(validateToken(req.query.token)){
    if(req.query.type === 'event'){
      if(req.query.createnew === 'true'){
        const ed = req.query.eventdata
        db.none('INSERT INTO events \
        (eventid, datestart, dateend, title, brief, description, image, enabled, priority, link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',[
          req.query.targetid, ed.datestart, ed.dateend, ed.title, ed.brief, ed.description, ed.image, ed.enabled, ed.priority, ed.link
        ])
        .then(()=>{
          res.json({result:true})
        })
        .catch((err)=>{
          console.log(err)
        })
      }else{
        const ed = req.query.eventdata
        db.none('UPDATE events SET datestart=$1, dateend=$2, title=$3, brief=$4, description=$5, image=$6, enabled=$7, priority=$8, link=$9 WHERE eventid=$10;',[
          ed.datestart, ed.dateend, ed.title, ed.brief, ed.description, ed.image, ed.enabled, ed.priority, ed.link, req.query.targetid
        ])
        .then(()=>{
          res.json({result:true})
        })
        .catch((err)=>{
          console.log(err)
        })
      }
    }else if(req.query.type === "desc"){
      const dd = req.query.descdata
      db.none('UPDATE descs SET context=$1, dateedit=CURRENT_DATE WHERE descid=$2;',[dd.context,req.query.targetid])
      .then(()=>{
        res.json({result:true})
      })
      .catch((err)=>{
        console.log(err)
      })
    }
  }else{
    console.log("wrong token! --- modification rejected")
    res.json({result:false})
  }
})

app.get('/deleteevent',(req,res)=>{
  if(validateToken(req.query.token)){
    db.none('DELETE FROM events WHERE eventid=$1;',req.query.targetid)
    .then(()=>{
      res.json({result:true})
    })
    .catch((err)=>{
      console.log(err)
    })
  }
})

process.on('unhandledRejection', r => console.log(r)); //error catcher