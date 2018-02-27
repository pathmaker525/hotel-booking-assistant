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

const nodemailer = require('nodemailer')
/*
const smtpTransport = nodemailer.createTransport({  
  service: 'Gmail',
  auth: {
      user: '구글메일 아이디',
      pass: '구글메일 비밀번호'
  }
});
*/

const storage = multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null,'pub/')
  },
  filename: (req,file,cb)=>{
    cb(null,Date.now() + file.originalname)
  }
})
const upload = multer({storage:storage})

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
  }else if(req.query.type === "desclastid"){
    db.one('SELECT max(descid) as lastid FROM descs;')
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
  db.any('SELECT eventid, bannerimage, link FROM events WHERE datestart >= CURRENT_DATE AND CURRENT_DATE <= dateend ORDER BY priority, eventid;')
  .then((sqldata)=>{
    if(sqldata.length >= 1) {
      res.render('index.ejs',{events:sqldata})
    }else{
      res.render('index.ejs',{events:
        [{title:"진행중인 이벤트가 없습니다",bannerimage:""}]
      })
    }
  })
  .catch((err)=>{
    console.log(err)
  })
})

app.get('/rooms', (req,res) => {
  res.render('rooms.ejs')
})

app.get('/locations',(req,res)=>{
  //0,1, place = 2, restaurant = 3
  db.multi('SELECT title, maplink, weblink, image, extra, context from descs WHERE category=2;'
  + 'SELECT title, maplink, weblink, image, extra, context from descs WHERE category=3;')
  .then((sqldata)=>{
    res.render('locations.ejs',{places:sqldata[0], foods:sqldata[1]})
  })
  .catch((err)=>{
    console.log(err)
  })
})

app.get('/offers',(req,res)=>{
  let queryadd = ''
  if(req.query.eventid){
    queryadd = `SELECT image FROM events WHERE eventid=${req.query.eventid};`
  }
  db.multi('SELECT * FROM events WHERE enabled=true AND datestart <= CURRENT_DATE AND CURRENT_DATE <= dateend;' +
            'SELECT * FROM events WHERE enabled=true AND datestart > CURRENT_DATE OR CURRENT_DATE > dateend;' + queryadd)
  .then((sqldata)=>{
    if(sqldata.length < 3){
      res.render('offers.ejs',{init:'', currentEvents:sqldata[0], pastEvents:sqldata[1]})
    }else{
      res.render('offers.ejs',{init:sqldata[2][0].image, currentEvents:sqldata[0], pastEvents:sqldata[1]})
    }
  })
  .catch((err)=>{
    console.log(err)
  })
})

app.get('/about',(req,res)=>{
  res.render('about.ejs')
})

app.get('/temp',(req,res) =>{
  res.render('template.ejs')
})

app.get('/reservation',(req,res)=>{
  db.any('SELECT eventid,title FROM events WHERE enabled=true AND datestart <= CURRENT_DATE AND CURRENT_DATE <= dateend')
  .then((sqldata)=>{
    res.render('reservation.ejs',{pkgs:sqldata})
  })
  .catch((err)=>{

  })
})

app.post('/reservation',(req,res)=>{
  console.log(req.body)
  res.status(200).render('confirmed.ejs',{msgtitle:'요청하신 내용 전송이 완료되었습니다',msgdetail:'최대한 빨리 답변 드리겠습니다'})
  /*
  let sender = '송성광 <saltfactory@gmail.com>'
  let subject = '예약메일'
  let htmlContent = '<h1>HTML 보내기 테스트</h1><p><img src="http://www.nodemailer.com/img/logo.png"/></p>'

  const mailOptions = {  
    from: sender,
    to: 'rsv@stellarmarinahotel.com',
    subject: subject,
    //text: '평문 보내기 테스트 '
    html: htmlContent
  };

  smtpTransport.sendMail(mailOptions, function(error, response){
    if (error){
        console.log(error);
    } else {
        console.log("Message sent : " + response.message);
    }
    smtpTransport.close();
    res.status(200);
  });
  */
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

app.get('/dbreset',(req,res)=>{
  console.log('db reset attempt: ' + req.query.token)
  if(validateToken(req.query.token)){
    db.tx(t1 => {
      return t1.batch([
        t1.none('DROP TABLE IF EXISTS events;'),
        t1.none('DROP TABLE IF EXISTS descs;'),
        t1.tx(t2=>{
          return t2.batch([

            t2.none('CREATE TABLE events (eventid serial not null primary key,\
              datestart date,\
              dateend date,\
              title varchar(20),\
              brief varchar(40),\
              description text,\
              image varchar(255),\
              bannerimage varchar(255),\
              enabled bool,\
              priority int,\
              link varchar(255));'),

            t2.none('CREATE TABLE descs (descid serial not null primary key,\
              category int,\
              title varchar(100),\
              context text,\
              dateedit date,\
              weblink varchar(255),\
              maplink varchar(255),\
              image varchar(255),\
              extra varchar(255));')
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
})

//change every upload to 'post' --> query is not safe for transaction
//return status after finishing the action --> 200:ok, 204:empty but ok, 400:bad request

//modify with image
app.post('/modwimg',upload.any(),(req,res,next)=>{
  console.log('upload request with image')
  console.log('query:',req.query)
  console.log('body:',req.body.data)
  
  let bodydata = JSON.parse(req.body.data)
  console.log('files info:',req.files)

  if(validateToken(req.query.token)){
    if(req.query.type === 'event'){

      if(req.files.length > 2){
        console.log('*** the server has received more than 2 images while uploading ***')
      }
      req.files.forEach((singleFile)=>{
        if(singleFile.fieldname === 'image'){
          bodydata.image = singleFile.filename
        }else if(singleFile.fieldname === 'bannerimage'){
          bodydata.bannerimage = singleFile.filename
        }
      })

      if(req.query.createnew === 'true'){
        const ed = bodydata
        db.none('INSERT INTO events \
        (eventid, datestart, dateend, title, brief, description, image, bannerimage, enabled, priority, link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);',[
          req.query.targetid, ed.datestart, ed.dateend, ed.title, ed.brief, ed.description, ed.image, ed.bannerimage, ed.enabled, ed.priority, ed.link
        ])
        .then(()=>{
          //send status so that the browser won't hang
          res.status(200).json({result:true})
        })
        .catch((err)=>{
          console.log(err)
        })
      }else{
        const ed = bodydata
        db.none('UPDATE events SET datestart=$1, dateend=$2, title=$3, brief=$4, description=$5, image=$6, enabled=$7, priority=$8, link=$9, bannerimage=$10 WHERE eventid=$11;',[
          ed.datestart, ed.dateend, ed.title, ed.brief, ed.description, ed.image, ed.enabled, ed.priority, ed.link, ed.bannerimage, req.query.targetid
        ])
        .then(()=>{
          res.status(200).json({result:true})
        })
        .catch((err)=>{
          console.log(err)
        })
      }
    }else if(req.query.type === "desc"){
      if(req.files[0]) {bodydata.image = req.files[0].filename}
        console.log(bodydata)
        if(req.query.createnew === 'true'){
          db.none('INSERT INTO descs (dateedit, title, context, image, weblink, maplink, extra, category) VALUES (CURRENT_DATE, $1, $2, $3, $4, $5, $6, $7);',[
            bodydata.title, bodydata.context, bodydata.image, bodydata.weblink, bodydata.maplink, bodydata.extra, bodydata.category])
          .then(()=>{
            res.status(200).json({result:true})
          })
          .catch((err)=>{
            console.log(err)
          })
        }else{
          db.none('UPDATE descs SET context=$1, image=$2, dateedit=CURRENT_DATE, title=$4, weblink=$5, maplink=$6, extra=$7, category=$8 WHERE descid=$3;',[
            bodydata.context, bodydata.image, req.query.targetid, bodydata.title, bodydata.weblink, bodydata.maplink, bodydata.extra, bodydata.category])
          .then(()=>{
            res.status(200).json({result:true})
          })
          .catch((err)=>{
            console.log(err)
          })
        }
    }
  }else{
    console.log("wrong token! --- modification rejected")
    res.json({result:false})
  }

})

//modify without image
app.post('/modwoimg',(req,res)=>{
})

app.get('/delete',(req,res)=>{
  const dbtarget = (/(.*)s$/g.exec(req.query.dbtype))[1] + 'id'
  //pg-promise is not ready for substituting dbname with queries...so it was necessary to create another querystring...
  const querystring = `DELETE FROM ${req.query.dbtype} WHERE ${dbtarget} = ${req.query.targetid}`
  console.log(querystring)
  if(validateToken(req.query.token)){
    db.none(querystring)
    .then(()=>{
      res.json({result:true})
    })
    .catch((err)=>{
      console.log(err)
    })
  }
})

process.on('unhandledRejection', r => console.log(r)); //error catcher