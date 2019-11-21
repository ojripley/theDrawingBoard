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

const { ActiveUsers } = require('./objects/activeUsers');
const { Authenticator } = require('./objects/authenticator');

activeUsers = new ActiveUsers();
authenticator = new Authenticator();

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
});


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


io.on('connection', (client) => {
  console.log('new client has connected');
  client.emit('msg', "there's a snake in my boot!");

  // handles logging in and activeUsers
  client.on('loginAttempt', (data) => {
    console.log('initiating login attempt');
    authenticator.authenticate(data.email, data.password)
      .then(res => {
        const authenticateAttempt = res;

        if (authenticateAttempt) {
          console.log('attempted login: successful');
          console.log(authenticateAttempt);
          activeUsers.addUser(authenticateAttempt.username, client)

          // client.on('disconnect', () => {
          //   activeUsers.removeUser(data.username);
          // })
        } else {
          console.log('attempted login: failed');
        }
        client.emit('loginResponse', authenticateAttempt);
      })
  });










  // active users test code
  // user = {
  //   username: 'testee mctester'
  // }

  // activeUsers.addUser(user, client);

  // console.log(activeUsers);






  client.on('msg', (data) => {
    console.log(data);
  });

  client.on('fetchUser', (data) => {
    db.fetchUserByEmail(data.email)
      .then(res => {
        client.emit('user', res);
      });
  });

  client.on('fetchContactsByUserId', (data) => {
    db.fetchContactsByUserId(data.id, data.username)
      .then(res => {
        client.emit('contactsByUserId', res);
      });
  });

  client.on('fetchContactsGlobal', (data) => {
    db.fetchUsersByUsername(data.username)
      .then(res => {
        client.emit('contactsGlobal', res);
      });
  })

  client.on('fetchMeetings', (data) => {
    db.fetchMeetingsByUserId(data.username, data.meetingStatus)
      .then(res => {
        client.emit('meetings', res);
      });
  });

  client.on('fetchMeeting', (data) => {
    db.fetchMeetingById(data.id)
      .then(res => {
        client.emit('meeting', res);
      });
  });

  client.on('addUser', (data) => {

    const credentials = {
      ...data
    };

    // if (authenticator.registerUser(credentials))

    db.insertUser(credentials.username, credentials.email, credentials.password)
      .then(res => {
        client.emit('loginAttempt', credentials.username);
      });
  });

  client.on('insertMeeting', data => {
    db.insertMeeting(data.startTime, data.ownerId, data.name, data.description, data.status, data.linkToInitialDoc)
      .then(res => {
        client.emit('newMeeting', res);
      });
  });

  client.on('insertUsersMeeting', data => {
    db.insertUsersMeeting(data.userId, data.meetingId)
      .then(() => {
        client.emit('invitedUsers');
      });
  });

});

