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
const { ActiveMeeting } = require('./objects/activeMeetings');

activeUsers = new ActiveUsers();
authenticator = new Authenticator();
activeMeetings = new ActiveMeeting();

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
    authenticator.authenticate(data.email, data.password)
      .then(res => {
        const authenticateAttempt = res;

        if (authenticateAttempt) {
          activeUsers.addUser(authenticateAttempt.username, client)

          client.on('disconnect', () => {
            activeUsers.removeUser(data.username);
          });
        } else {
          console.log('attempted login: failed');
        }
        client.emit('loginResponse', authenticateAttempt);
      });
  });








































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
        client.emit('newMeeting', res[0]);
        // console.log(res[0].id);
        return res[0].id;
      })
      .then((id) => {

        const promiseArray = [];

        for (let contact of data.selectedContacts) {
          console.log(contact.username);
          promiseArray.push(db.insertUsersMeeting(contact.id, id));
        }

        return Promise.all(promiseArray).then(() => {
          return id;
        });




          // setTimeout(() => {
            //   console.log('\n\n\n\n\n\n\nWHAT FOLLOWS IS THE ID: ');
            //   console.log(id);
            //   db.fetchMeetingWithUsersById(id)
            //   .then(res => {
              //     console.log(res);
              //     client.emit('test', res[0]);
              //   });
              // }, 400);
      })
      .then((id) => {
        db.fetchMeetingWithUsersById(id)
          .then(res => {
            console.log(res);
            client.emit('itWorkedThereforeIPray', res[0]);
          });
      })
  });

  client.on('insertUsersMeeting', data => {
    db.insertUsersMeeting(data.userId, data.meetingId)
      .then(() => {
        client.emit('invitedUsers');
      });
  });

  client.on('startMeeting', (data) => {

    db.updateMeetingActiveState(data.id, true)
      .then(() => { // meeting status has been updated

        db.fetchMeetingById(data.id)
          .then(res => { // meeting has been retrieved
            const meeting = res[0];
            const attendeeIds = meeting.invited_users;

            // keep track of active meetings
            activeMeetings.addMeeting(meeting);
            console.log(activeMeetings[meeting.id]);
            for (let id of attendeeIds) {
              db.fetchUsersMeetingsByIds(id, meeting.id)
                .then(res => { // users have been identified
                  const user = res[0];
                  if (activeUsers[user.username]) {
                    const userClient = activeUsers[user.username].socket
                    userClient.emit('meetingStarted', meeting.id);
                  }
                });
            }
          });
      });
  });

  // gotta handle the end meeting event
  // client.on('endMeeting', (data), )
});

