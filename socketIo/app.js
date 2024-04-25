const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
require('dotenv').config();
const db = require('./config/db');
const bodyParser = require('body-parser');
const session = require('express-session');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({ 
    secret:process.env.SESSION_SECRET, 
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

const io = require('socket.io')(http);

app.use('/',require('./routers/user.route.js') );

    // io.on('connection', (socket) => {
    //     console.log('a user connected');
    //     socket.on('disconnect', () => {
    //         console.log('user disconnected');
    //     });
    // })

http.listen(4000, () => {
  console.log(`Example app listening at http://localhost:${4000}`);
});

