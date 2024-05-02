const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
require('dotenv').config();
const db = require('./config/db');
const bodyParser = require('body-parser');
const session = require('express-session');
const user = require('./models/User.model.js');
const chat = require('./models/Chat.model.js');
const cookieParser = require('cookie-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET,
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

const io = require('socket.io')(http);

app.use('/', require('./routers/user.route.js'));

const userNamespace = io.of('/user-namespace')
userNamespace.on('connection', async (socket) => {
  console.log('a user connected');
  const userId = socket.handshake.auth.token
  await user.findByIdAndUpdate({ _id: userId }, { $set: {isOnline: true}});

  //brodcast online status
  socket.broadcast.emit('getUserOnline',{user_id:userId})
  
  socket.on('disconnect', async () => {
    await user.findByIdAndUpdate({ _id: userId },  { $set: {isOnline: false}});
    //brodcast offline status
    socket.broadcast.emit('getUserOffline',{user_id:userId})
    console.log('user disconnected');
  });

  // cahtting emplimentation
  socket.on("newChat",(data)=>{
    socket.broadcast.emit('loadNewChat',data)
  })

  // load old chat 
  socket.on("existCaht",async (data)=>{
      const chats = await chat.find({$or:[
        {
          senderId:data.sender_id,
          receiverId:data.receiver_id
        },
        {
          senderId:data.receiver_id,
          receiverId:data.sender_id
        }
      ]})
      socket.emit('loadOldChat',{chats:chats})
  })

  // delete chat 
  socket.on("chatDelete",async (id)=>{
    socket.broadcast.emit('deleteChatMessage',id)
  })
})

http.listen(4000, () => {
  console.log(`Example app listening at http://localhost:${4000}`);
});

