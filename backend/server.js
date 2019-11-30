
//////////////////
// SERVER SETUP //
//////////////////

// load .env data into process.env
require('dotenv').config();

// server config
const PORT = process.env.PORT || 8080;
const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();
const morgan = require('morgan');
const server = require('http').Server(app);
const io = require('socket.io')(server, { cookie: "yo" });
const crypto = require('crypto');
const fs = require('fs');
const PDFImage = require("pdf-image").PDFImage;
const colors = require('./colors.json')["colors"];

// import helper objects
const { ActiveUsers } = require('./objects/activeUsers');
const { Authenticator } = require('./objects/authenticator');
const { ActiveMeetings } = require('./objects/activeMeetings');

// instantiate objects
activeUsers = new ActiveUsers();
authenticator = new Authenticator();
activeMeetings = new ActiveMeetings();

// import db operations
const db = require('./db/queries/queries');

db.clearToHistory();

// CORS
app.use(cors());


// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
// The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

const key = "zb2WtnmaQvF5s9Xdpmae5LxZrHznHXLQ"; //secret
const iv = new Buffer.from("XFf9bYQkLKtwD4QD"); //Could use random bytes, would refresh on server refresh

function encrypt(text) {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
  console.log('decryptiv', text.iv);
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

app.use(bodyParser.urlencoded({ extended: true }));

// this is super important
app.get("/", (req, res) => {
  res.send('backend');
});

// start server listening
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});



////////////////////////
// CLIENT INTERACTION //
////////////////////////

// notification function
const notify = function(userId, notification) {

  // assign notificationId with res.id after a db query
  notification.userId = userId;

  if (notification.type === 'meeting') {
    db.insertMeetingNotification(userId, notification)
      .then(res => {
        notification.id = res[0].id;
        notification.time = res[0].time;

        // only emit if the client is online
        if (activeUsers[userId]) {
          activeUsers[userId].socket.emit('notify', notification);
        }
      });
  }

  if (notification.type === 'dm' || notification.type === 'contact') {
    db.insertContactNotification(userId, notification)
      .then(res => {
        notification.id = res[0].id;
        notification.time = res[0].time;

        // only emit if the client is online
        if (activeUsers[userId]) {
          activeUsers[userId].socket.emit('notify', notification);
        }
      });
  }
}

setInterval(() => {
  db.fetchStartedMeetings()
    .then(res => {
      for (let meeting of res) {
        notify(meeting.owner_id, { title: 'Time for Your Meeting', type: 'meeting', msg: `'${meeting.name}' is scheduled to start now!`, meetingId: meeting.id, ownerId: meeting.owner_id })
      }
    })
    .catch(error => {
      handleError(error, client);
    });
}, 60000); // if you're bad at math, this is 60 seconds (1 minute for those of you who are really bad at math)




///////////////////
// SOCKET EVENTS //
///////////////////

// socket events
io.on('connection', (client) => {
  console.log('new client has connected');
  client.emit('msg', "there's a snake in my boot!");

  console.log('client headers', client.request.headers.cookie);

  let cookieString = ""; //This will grab the clients session cookie should it exist
  let ivString = ""; //This will grab the clients session cookie should it exist
  if (client.request.headers.cookie) {
    let matches = client.request.headers.cookie.match(/(?<=sid=)[a-zA-Z0-9]*/);
    if (matches) cookieString = matches[0];

    ivMatch = client.request.headers.cookie.match(/(?<=iv=)[a-zA-Z0-9]*/);
    if (ivMatch) ivString = ivMatch[0];
  }

  //Checks cookie
  client.on('checkCookie', () => {
    console.log('cookie check');
    console.log(cookieString);
    console.log(ivString);

    if (cookieString && ivString) {
      try {
        let email = decrypt({ encryptedData: cookieString, iv: iv });
        console.log('decrypted', email);
        db.fetchUserByEmail(email)
          .then(res => {
            const user = { id: res[0].id, username: res[0].username, email: res[0].email }
            client.emit('cookieResponse', user);
            db.fetchNotificationsByUser(user.id)
              .then(res => {
                client.emit('allNotifications', res);
              })
            activeUsers.addUser(user, client);

            client.on('disconnect', () => {
              activeUsers.removeUser(user.id);
            });
          })
          .catch(error => {
            handleError(error, client);
          });
      } catch (err) {
        console.error('Cookie authentication failed!');
      }
    } else {
      client.emit('cookieResponse', null);
    }
  });

  client.on('registrationAttempt', (data) => {
    authenticator.register(data.username, data.email, data.password)
      .then(res => {
        console.log('registration attempt', res);
        delete res[0].password;
          client.emit('WelcomeYaBogeyBastard', (res[0]));
      })
      .catch(error => {
        handleError(error, client);
      });
  });

  // handles logging in and activeUsers
  client.on('loginAttempt', (data) => {
    console.log('authenticating...');
    console.log(data);
    authenticator.authenticate(data.email, data.password)
      .then(res => {
        const authenticateAttempt = res;
        if (authenticateAttempt) {
          console.log('id to be added:');
          console.log(authenticateAttempt.id);
          activeUsers.addUser(authenticateAttempt, client);

          client.on('disconnect', () => {
            activeUsers.removeUser(authenticateAttempt.id);
          });
        } else {
          console.log('attempted login: failed');
        }
        console.log('sending response');
        if (authenticateAttempt.id) {
          let enc = encrypt(authenticateAttempt.email);
          client.emit('loginResponse', {
            user: authenticateAttempt,
            session: { sid: enc.encryptedData, iv: enc.iv }
          });
        } else {
          client.emit('loginResponse', {
            user: authenticateAttempt,
            session: ""
          });
        }
        db.fetchNotificationsByUser(authenticateAttempt.id)
          .then(res => {
            console.log('sending');
            console.log(res);
            client.emit('allNotifications', res);
          })
          .catch(error => {
            handleError(error, client);
          });
      })
      .catch(error => {
        handleError(error, client);
      });
  });

  client.on('addClick', data => {
    activeMeetings[data.meetingId].userPixels[data.user.id].push(data.pixel);
    io.to(data.meetingId).emit('drawClick', data); //pass message along
  });

  client.on('setPointer', data => {
    activeMeetings[data.meetingId].pointers[data.user.id] = data.pixel;
    io.to(data.meetingId).emit('setPointer', data); //pass message along
  });

  //End of test
  client.on('msg', (data) => {
    console.log(data);
  });

  client.on('fetchUser', (data) => {
    db.fetchUserByEmail(data.email)
      .then(res => {
        user = { id: res.id, username: res.username, email: res.email };
        client.emit('user', user);
      });
  });

  client.on('fetchContactsByUserId', (data) => {
    db.fetchContactsByUserId(data.id, data.username)
      .then(res => {
        console.log(res);
        client.emit('contactsByUserId', res);
      });
  });

  client.on('fetchContactsGlobal', (data) => {
    db.fetchUsersByUsername(data.username, data.user.id)
      // db.fetchUsersByUsername(data.user.id)
      .then(res => {
        console.log(res);
        client.emit('contactsGlobal', res);
      });
  })

  client.on('fetchMeetings', (data) => {
    db.fetchMeetingsByUserId(data.username, data.meetingStatus)
      .then(res => {
        client.emit('meetings', res);
      });
  });

  client.on('addUser', (data) => {

    const credentials = {
      ...data
    };

    db.insertUser(credentials.username, credentials.email, credentials.password)
      .then(res => {
        client.emit('loginAttempt', credentials.username);
      });
  });

  client.on('insertMeeting', data => {
    db.insertMeeting(data.startTime, data.ownerId, data.name, data.description, data.status, data.file.name)
      .then(res => {
        client.emit('newMeeting', res[0]);
        return res[0].id;
      })
      .then((id) => {
        fs.mkdir(`meeting_files/${id}`, () => { //makes a new directory for the meeting
          console.log(data.filename);
          if (data.file.name) { //Only save the file if one exists, otherwise just have an empty folder
            //Check if pdf
            if (data.file.name.search(/\.pdf$/ig) !== -1) {

              console.log(data.file.name);
              fs.writeFile(`meeting_files/${id}/${data.file.name}`, data.file.payload, (err) => {
                if (err) {
                  console.log('problem');
                  throw err;
                }
                console.log('The file has been saved!');

                let pdfImage = new PDFImage(`meeting_files/${id}/${data.file.name}`);

                // console.log(pdfImage);

                pdfImage.convertPage(0).then(function(imagePath) {
                  // 0-th page (first page) of the slide.pdf is available as slide-0.png
                  fs.existsSync("/tmp/slide-0.png") // => true\
                  console.log(imagePath);
                })
                  .catch((error) => {
                    console.log(error);
                  })
              }); //Note promisy this I if we want to wait for the upload to finish before creating meeting
            } else {
              fs.writeFile(`meeting_files/${id}/${data.file.name}`, data.file.payload, (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
              }); //Note promisy this I if we want to wait for the upload to finish before creating meeting
            }
          }
        });
        const promiseArray = [];

        for (let contact of data.selectedContacts) {
          promiseArray.push(db.insertUsersMeeting(contact.id, id));
        }

        return Promise.all(promiseArray).then(() => {
          return id;
        });
      })
      .then((id) => {
        db.fetchMeetingWithUsersById(id)
          .then(res => {
            for (let contactId of res[0].attendee_ids) {
              notify(contactId, { title: 'New Meeting Invite', type: 'meeting', msg: `You have been invited to the meeting '${res[0].name}! Please RSVP`, meetingId: res[0].id, ownerId: res[0].owner_id });
              if (activeUsers[contactId]) {
                console.log(`${contactId} should now rerender`);
                activeUsers[contactId].socket.emit('itWorkedThereforeIPray', res[0]);
              }
            }
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

            // set meeting properties
            meeting['liveUsers'] = {};
            meeting['userPixels'] = {};
            meeting['pointers'] = {};
            // meeting['userColors'] = ['#000000', '#4251f5', '#f5eb2a', '#f022df', '#f5390a', '#f5ab0a', '#f5ab0a', '#a50dd4']; //Default colors to use
            meeting['userColors'] = colors;
            // meeting['userColors'] = ['rgb(0,0,0,1)', 'rgb(255,0,0,1)', 'rgb(0,0,255,1)', '#f022df', '#f5390a', '#f5ab0a', '#f5ab0a', '#a50dd4']; //Default colors to use
            meeting['counter'] = 0;
            meeting['colorMapping'] = {};

            const attendeeIds = meeting.invited_users;

            console.log(meeting);

            // keep track of active meetings
            activeMeetings.addMeeting(meeting);
            // console.log(activeMeetings[meeting.id]);

            // send the meeting to all users who are logged in && invited to that meeting
            for (let id of attendeeIds) {
              notify(id, { title: 'Meeting Started', type: 'meeting', msg: `Meeting '${meeting.name}' has started!`, meetingId: meeting.id, ownerId: meeting.owner_id });
              if (activeUsers[id]) {
                activeUsers[id].socket.emit(`meetingStarted${meeting.id}`, { meetingId: meeting.id, ownerId: meeting.owner_id });
              }
            }
          });
      });
  });

  client.on('enterMeeting', (data) => {

    activeMeetings[data.meetingId].liveUsers[data.user.id] = true;
    console.log(activeMeetings[data.meetingId].liveUsers);

    let meetingDetails = activeMeetings[data.meetingId];
    if (!meetingDetails.userPixels[data.user.id]) {
      meetingDetails.userPixels[data.user.id] = [];
    }

    //Select a color:
    let col = meetingDetails['colorMapping'][data.user.id];
    if (!col) {
      col = meetingDetails['userColors'][(meetingDetails['counter']++) % colors.length];
      meetingDetails['colorMapping'][data.user.id] = col;
    }

    console.log("Looking for", `meeting_files/${data.meetingId}/${meetingDetails.link_to_initial_doc}`);

    let img = "";
    if (meetingDetails.link_to_initial_doc) {
      if (meetingDetails.link_to_initial_doc.search(/\.pdf$/ig) !== -1) {
        img = meetingDetails.link_to_initial_doc.split(/\.pdf$/ig)[0] + "-0.png";
      } else {
        img = meetingDetails.link_to_initial_doc;
      }
      fs.readFile(`meeting_files/${data.meetingId}/${img}`, (err, image) => {
        if (err) {
          console.error;
          image = "";
        }
        console.log("sending these pixels");
        console.log(meetingDetails.userPixels);

        console.log()
        db.fetchUsersMeetingsByIds(data.user.id, data.meetingId)
          .then((res) => {

            client.emit(`enteredMeeting${meetingDetails.id}`, { meeting: meetingDetails, notes: res[0].notes, pixels: meetingDetails.userPixels, image: "data:image/jpg;base64," + image.toString("base64") });

            client.join(data.meetingId);

            io.to(data.meetingId).emit('newParticipant', { user: data.user, color: col });
          });
      });
    } else {
      db.fetchUsersMeetingsByIds(data.user.id, data.meetingId)
        .then((res) => {

          client.emit(`enteredMeeting${meetingDetails.id}`, { meeting: meetingDetails, notes: res[0].notes, pixels: meetingDetails.userPixels, image: "" });

          client.join(data.meetingId);

          io.to(data.meetingId).emit('newParticipant', { user: data.user, color: col });
        });
    }
  });

  client.on('saveDebouncedNotes', (data) => {
    console.log('attempting to write notes');
    console.log(data.notes);
    db.updateUsersMeetingsNotes(data.user.id, data.meetingId, data.notes);
  });

  // gotta handle the end meeting event
  client.on('savingMeeting', data => {
    io.to(data.meetingId).emit('loadTheSpinnerPls');
  })

  client.on('endMeeting', (data) => {

    let meetingDetails = activeMeetings[data.meetingId];

    let img;
    if (meetingDetails.link_to_initial_doc) {
      if (meetingDetails.link_to_initial_doc.search(/\.pdf$/ig) !== -1) {
        img = meetingDetails.link_to_initial_doc.split(/\.pdf$/ig)[0] + "-0.png";
      } else {
        img = meetingDetails.link_to_initial_doc;
      }
    } else {
      img = 'blank.png'
    }

    fs.writeFile(`meeting_files/${data.meetingId}/markup_${img}`, data.image.replace(/^data:image\/png;base64,/, ""), 'base64', (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
      console.log(`markup_${img}`);
      db.updateMeetingById(data.meetingId, data.endTime, false, 'past', `markup_${img}`);
    });

    io.to(data.meetingId).emit('requestNotes', data.meetingId);

    for (let id of meetingDetails.invited_users) {
      notify(id, { title: 'Meeting Ended', type: 'meeting', msg: `Meeting '${meetingDetails.name}' has ended! You may check the details in History`, meetingId: meetingDetails.id });
    }
    activeMeetings.removeMeeting(data.meetingId);

    console.log(`meeting ${data.meetingId}is done`);
  });

  client.on('notes', (data) => {
    console.log('getting notes from', data);
    db.updateUsersMeetingsNotes(data.user.id, data.meetingId, data.notes)
      .then(() => {
        client.emit('concludedMeetingId', data.meetingId);
      });
  });

  client.on('fetchNotes', (data) => {
    db.fetchUsersMeetingsByIds(data.user.id, data.meetingId)
      .then((res) => {
        fs.readFile(`meeting_files/${data.meetingId}/${data.linkToFinalDoc}`, (err, image) => {
          if (err) {
            console.error;
            image = "";
          }
          client.emit('notesFetched', { usersMeetings: res[0], image: "data:image/jpg;base64," + image.toString("base64") });
        });
      });
  });

  client.on('addContact', (data) => {

    // user requests contact add
    db.insertFriend(data.user.id, data.contactId, 'requested');

    // friend is now a pending add
    db.insertFriend(data.contactId, data.user.id, 'pending');

    // tell the user they're request has been sent
    client.emit('relationChanged', { relation: 'requested', contactId: data.contactId });

    // tell contact that they have a friend request
    notify(data.contactId, { title: 'Friend Request', type: 'contact', msg: `${data.user.username} has requested to add you as a friend!`, senderId: data.user.id });
    if (activeUsers[data.contactId]) {
      activeUsers[data.contactId].socket.emit('relationChanged', { relation: 'pending', contactId: data.user.id });
    }
  });

  client.on('changeRelation', (data) => {

    // change the user relation
    db.updateFriendStatus(data.user.id, data.contactId, data.relation)
    client.emit('relationChanged', { relation: data.relation, contactId: data.contactId });

    // change the contact status based on what the user relation was
    if (data.relation === 'accepted') {
      notify(data.contactId, { title: 'Friend Request Accepted', type: 'contact', msg: `${data.user.username} has accepted your friend request!`, senderId: data.user.id });

      db.updateFriendStatus(data.contactId, data.user.id, 'accepted');
      if (activeUsers[data.contactId]) {
        activeUsers[data.contactId].socket.emit('relationChanged', { relation: 'accepted', contactId: data.user.id });
      }
    }
  });

  client.on('deleteContact', (data) => {
    db.deleteContact(data.user.id, data.contactId);
    db.deleteContact(data.contactId, data.user.id);

    client.emit('relationChanged', { relation: null, contactId: data.contactId });
    if (activeUsers[data.contactId]) {
      activeUsers[data.contactId].socket.emit('relationChanged', { relation: null, contactId: data.user.id });
    }
  });

  client.on('deleteMeeting', (data) => {
    db.deleteMeeting(data.meetingId)
      .then(() => {
        for (let contactId of data.attendeeIds) {
          if (activeUsers[contactId]) {
            activeUsers[contactId].socket.emit('meetingDeleted', { id: data.meetingId });
          }
        }
      });
  });

  client.on('changeAttendance', (data) => {
    if (data.rsvp === 'declined') {
      db.removeUserFromMeeting(data.user.id, data.meetingId);
    } else {
      db.updateUsersMeetingsStatus(data.user.id, data.meetingId, data.rsvp);
    }

    client.emit('attendanceChanged', { meetingId: data.meetingId });
  });

  client.on('dismissNotification', (data) => {
    console.log('dismissing notification number', data.id);
    db.removeNotificationById(data.id);
  });

  client.on('dismissAllNotifications', (data) => {
    console.log('dismissing notification by user', data.userId);
    db.removeNotificationsByUserId(data.userId);
  });

  client.on('dismissNotificationType', (data) => {
    console.log('dismissing notification by type', data.userId, data.type);
    db.removeNotificationsByType(data.userId, data.type);
  });

  client.on('undoLine', (data) => {

    if (activeMeetings[data.meetingId]) {
      const pixels = activeMeetings[data.meetingId].userPixels[data.user.id];
      console.log('pixels:', pixels)

      if (pixels.length > 0) {
        while (pixels[pixels.length - 1].dragging !== false) {
          pixels.pop();
        }
        if (pixels[pixels.length - 1].dragging === false) {
          // remove last pixel
          pixels.pop();
        }
      }
    }

    io.to(data.meetingId).emit('redraw', { meetingId: data.meetingId, pixels: activeMeetings[data.meetingId].userPixels, user: data.user })
  });

  client.on('msgToMeeting', (data) => {
    io.to(data.meetingId).emit('meetingMsg', { msg: data.msg, user: data.user, time: Date.now() });
  });

  client.on(`msgToUser`, (data) => {
    if (activeUsers[data.contactId]) {
      activeUsers[data.contactId].socket.emit('userMsg', { msg: data.msg, user: data.user });
    }
  });

  client.on('peacingOutYo', (data) => {

    // user leaves room
    activeMeetings[data.meetingId].liveUsers[data.user.id] = false;
    client.leave(data.meetingId);

    // tell the room who left
    io.to(data.meetingId).emit('userLeft', {user: data.user, meetingId: data.meetingId});
    console.log(activeMeetings[data.meetingId].liveUsers);
    console.log(`${data.user.username} has left meeting ${data.meetingId}`);
  });

  client.on('sendDm', (data) => {
    client.emit('dm', (data));

    if (activeUsers[data.recipientId]) {
      activeUsers[data.recipientId].socket.emit('dm', (data));
    }

    db.insertIntoDms(data.userId, data.senderId, data.msg, data.timestamp);
  })
});
