const express = require('express')
const app = express()
const http = app.listen(3000)
const bodyParser = require('body-parser')
const {router, pool} = require('./user-auth/user')
const {admin} = require('./admin-panel/admin')
//const chat = require('./chat/chat')
const io = require('socket.io')(http)
// 0988271000
app.use('/',router)
//app.use('/chat',chat)
app.use(express.static(__dirname + '/public/'))

app.set('view engine', 'ejs')

const encoder = bodyParser.urlencoded({ extended: false })

app.get('/',function(req,res){
 res.send('best chat app in the WORLD')
})

app.get('/index/:id', function(req,res){
  pool.connect() 
 pool.query("SELECT username, f_id , f_name FROM user_data WHERE id = '"+req.params.id+"';",(err, data)=>
 {
  res.render('index2', { myid: req.params.id, name: data.rows[0].username, photo: data.rows[0].image, fid: data.rows[0].f_id, fname: data.rows[0].f_name})
})
})

app.get('/find/:myid', encoder, function(req,res){
  
  if(req.query.friend_name!=null){
 
  pool.query("SELECT id FROM user_data WHERE username = '"+req.query.friend_name+"'",(err,data)=>
  {
    var id_list = new Array()

    for(i in data.rows){
      if(req.params.myid != data.rows[i].id){
      id_list[i] = data.rows[i].id
      }
    }
    res.render('searched-friends', {uid: req.params.myid, f_id : id_list, f_name : req.query.friend_name })
 })
}
  else{
    res.render('search-friend',{uid: req.params.myid})
  }
})

app.get('/add/:id/:name/:myid', (req,res)=>{
  
  pool.query("SELECT f_id, f_name FROM user_data WHERE id = '"+req.params.myid+"';",(err,data)=>
  {
    var f_id_list = new Array(), f_name_list = new Array(), dupli = false
  
    if(req.params.myid != req.params.id){

    if(data.rows[0].f_id != null){

    f_id_list = data.rows[0].f_id

   
    f_id_list.forEach(e=>{
      if(e === req.params.id)
      {
        dupli = true;
      }
    })
  
    if(dupli == false){
      f_id_list.push(parseInt(req.params.id))
    
   
    f_name_list = data.rows[0].f_name
    f_name_list.push(req.params.name)
    }
  }
    else{
      f_id_list.push(parseInt(req.params.id))
      f_name_list.push(req.params.name)
    }
    console.log(f_id_list+" "+f_name_list)
    pool.query("UPDATE  user_data SET f_id = '{"+f_id_list+"}' , f_name = '{"+f_name_list+"}' ",(err,data)=>{
      if(err){console.log(err)}
      else {console.log(data)}
    })
  }
    res.redirect('/index/'+req.params.myid)
 })
})

app.get('/delete/:fid/:fname/:myid',function(req,res){

  pool.query("SELECT f_id , f_name FROM user_data WHERE id = "+req.params.myid+";",(err,data)=>{
    const f_id_list = new Array(),  f_name_list = new Array()
    console.log(data.rows[0].f_id+" delete - "+req.params.fid)

    data.rows[0].f_id.forEach(e => {
      if(e != req.params.fid){
        f_id_list.push(e)
        console.log(e)
      }
    })
      data.rows[0].f_name.forEach(e => {
        if(e != req.params.fname){
          f_name_list.push(e)
          console.log(e)
        }
      })
      
        pool.query("UPDATE user_data SET f_id = '{"+f_id_list+"}' , f_name = '{"+f_name_list+"}' WHERE id = "+req.params.myid+";")
    });
    
   res.redirect('/index/'+req.params.myid)
})

app.get('/chat/:fname/:fid/:myid/:myname',function(req,res){
  res.render('chat',{f_name: req.params.fname, f_id: req.params.fid, my_id: req.params.myid, my_name: req.params.myname})
})

var rooms = {}

//socket
io.on('connection', socket => {
  
  socket.emit('res', 'connected')

  socket.on('join-room', (room_name, id)=>{
    console.log(id+" joins "+room_name)
    socket.join(room_name)
   rooms.id = room_name
    });

  socket.on('upd-status', id=>{
    console.log(id+" joins himself")
    socket.join(id)
    socket.broadcast.to(id).emit('status',id)
    });

  socket.on('status-back', (id)=>{
    socket.broadcast.to(id).emit('return-status',id)
  })

  socket.on('send-chat', (room_name, sender_id, sender_name, receiver_id, msg)=>{
    if(rooms.receiver_id == room_name){
    socket.broadcast.to(room_name).emit('chat-msg', sender_id, sender_name, msg)
    }
    else{
      socket.broadcast.to(receiver_id).emit('chat-msg', sender_id, sender_name, msg)
    }
  });

  socket.on('disconnect', (id)=>{
   console.log(id+' is disconnected '+socket.rooms)
  })
  
})
