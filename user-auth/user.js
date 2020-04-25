const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const {Pool, Client} = require('pg')
const path = require('path')
const multer = require('multer')
const nodemailer = require('nodemailer')


router.use(express.static('C:/Users/HP/djangoProject/javascript/chatapp/public/'));

const filter = (req, file, cd)=>{
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
    cd(null, true)
  }
  else{
    cd(console.error("upload only jpeg/png file"), false)
  }
}

const storage = multer.diskStorage({
  destination : function(req, file, cb){
    cb(null, './public/user-images')

  },
  
  filename :  function(req, file, cb){
    cb(null, 'img'+req.params.myid)
  }
 
})

const upload = multer(
  {
    storage : storage,
    limit : {fileSize : 1024 * 1024 * 2},
    fileFilter : filter
  }
)

// encoder
const encoder = bodyParser.urlencoded({ extended: false })

//database connect
const pool = new Pool({
     user: 'postgres',
     host: 'localhost',
     database: 'myuser',
     password: 'imgreat',
     port: 5432
})
pool.connect()

router.get('/login', (req,res)=>{
    res.sendFile('C:/Users/HP/djangoProject/javascript/chatapp/public/user-login.html')
})

router.get('/signin',(req,res)=>{
    res.sendFile('C:/Users/HP/djangoProject/javascript/chatapp/public/user-sign.html')
})

var temp_store = new Map()

router.post('/uplode_DB', encoder, (req,res)=>{
  
   const user_data = {
    name: req.body.name,
    email: req.body.email,
    pass: req.body.password
  }

  const rand = Math.floor(100000 + Math.random() * 900000)+""
  sendOTP(rand, req.body.email)
 
  temp_store.set(rand, user_data)

  res.render('fillotp')
})

router.get('/verify-otp', (req,res)=>{ 
 const id = storeUser(temp_store.get(req.query.otp))
 console.log(id)
 res.render('upload_img',{myid: id})
})

router.post('/login', encoder,(req,res)=>{
  pool.query("SELECT id FROM user_data WHERE username = '"+req.body.name+"' ", (err, data)=>{
    console.log(data)
    res.redirect('index/'+data.rows[0].id)
   })
})

router.post('/upload_img/:myid', encoder, upload.single('file'), function (req, res, next) {
 
  res.redirect('/index/'+req.params.myid)
})


// email verification
function sendOTP(otp, email){

  const transport = nodemailer.createTransport({
    service : "Gmail",
    auth : {
      user: "chatapp10012000@gmail.com",
      pass: "cC@9837872241"
    }
  })

 const maildata = {
    to: email,
    subject: "Verify your account",
    text: otp
  } 
  transport.sendMail(maildata, (err, res)=>{
    if(err){console.log(err)}
    else{console.log("send")}
  })
}



module.exports.router = router 
module.exports.pool = pool

function storeUser(user_data){
  pool.query("INSERT INTO user_data(username, email, password) values('"+user_data.name+"', '"+user_data.email+"', '"+user_data.pass+"')",(err, stored)=>{})
  pool.query("SELECT id FROM user_data WHERE email = '"+user_data.email+"' AND password = '"+user_data.pass+"' ", (err, data)=>{
    if(err){ console.log(err)}
    return(data.rows[0].id)
  })
}

function getDataById(id){
  pool.query("SELECT username, f_id , f_name FROM user_data WHERE id = '"+id+"';",(err, data)=>
 {
  const user_data = {
    name: data.rows[0].name,
    email: data.rows[0].email,
    fid: data.rows[0].f_id,
    fname: data.rows[0].f_name
  }
  return(user_data)
 })
}
