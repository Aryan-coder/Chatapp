const express = require('express')
const chat = express.Router()
const io = require('socket.io')(http)


/*
const io = require('socket.io')
//const {db_connect, db_query} = require('./pgdb/connector')

chat.use(express.static(__dirname + '/public/'));

*/
chat.get('/',function(req,res){
    res.sendFile('C:/Users/HP/djangoProject/javascript/chatapp/chat/public/chat.html')
  })
 /* 
  io.on('connection', socket => {
    socket.emit('massege', 'connected')
  
    socket.on('send', data => {
      socket.broadcast.emit('chat', data)
    })
  
  })
*/
  module.exports = chat