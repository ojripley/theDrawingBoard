// load .env data into process.env
require('dotenv').config();

// server config
const PORT = process.env.PORT || 8080;
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const morgan = require('morgan');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cookieParser = require('cookie-session');

const { ActiveUsers } = require('./userObjects/activeUsers');

activeUsers = new ActiveUsers();

// db operations
const db = require('./db/queries/queries');

// db routes
const usersRoutes = require('./routes/usersRoutes');
const usersMeetingsRoutes = require('./routes/usersMeetingsRoutes');

// app.use('/', usersRoutes(db));

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
// The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.use(cookieParser({ signed: false }));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send('testing purposes only');

  // user = {
  //   username: 'testee mctester'
  // }

  // client = 'client';

  // activeUsers.addUser(user, client);

  // console.log(activeUsers);
});


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


io.on('connection', (client) => {
  console.log('new client has connected');

  user = {
    username: 'testee mctester'
  }

  client = 'client';

  activeUsers.addUser(user, client);

  console.log(activeUsers);

  client.emit('msg', "there's a snake in my boot!");

  client.on('fetchUser', (data) => {
    db.fetchUserByEmail(data.email)
      .then(res => {
        client.emit('user', res);
      });
  });

  client.on('fetchContacts', (data) => {
    db.fetchContactsById(data.id)
      .then(res => {
        client.emit('contacts', res);
      });
  });


  client.on('fetchMeetings', (data) => {
    db.fetchMeetingsByUserId(data.id, data.meetingStatus)
      .then(res => {
        socket.emit('meetings', res);
      });
  });

  client.on('fetchMeeting', (data) => {
    db.fetchMeetingsByUserId(data.id)
      .then(res => {
        socket.emit('meeting', res);
      });
  });

  client.on('addUser', (data) => {
    db
  })
});
