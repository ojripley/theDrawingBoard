
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
const io = require('socket.io')(server);
const crypto = require('crypto');
const fs = require('fs');
const PDFImage = require("pdf-image").PDFImage;
const colors = require('./colors.json')["colors"];

// import helper functions
const { handleError } = require('./functions/handleError');

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

// clears dead meetings to history on server restart
db.clearToHistory()
  .catch(error => {
    console.log(error);
  });

// CORS
app.use(cors());

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
// The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
const key = process.env.ENCRYPTION_KEY; //secret

function encrypt(text, iv) {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send('Gerald the Error Herald says: Oops, were you looking for www.thedrawingboard.site?');
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
      })
      .catch(error => {
        handleError(error, client);
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
      })
      .catch(error => {
        handleError(error, client);
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
}, 60000);



///////////////////
// SOCKET EVENTS //
///////////////////

io.on('connection', (client) => {
  console.log('new client has connected');
  client.emit('msg', "there's a snake in my boot!");

  // log emits from the user
  client.on('msg', (data) => {
    console.log(data);
  });

  let cookieString = ""; //This will grab the clients session cookie should it exist
  let ivString = ""; //This will grab the clients session cookie should it exist

  // Checks cookie
  client.on('checkCookie', (cookie) => {

    if (cookie) {
      let matches = cookie.match(/(?<=sid=)[a-zA-Z0-9]*/);
      if (matches) cookieString = matches[0];

      let ivMatch = cookie.match(/(?<=iv=)[a-zA-Z0-9]*/);
      if (ivMatch) ivString = ivMatch[0];
    }

    if (cookieString && ivString) {
      try {
        let email = decrypt({ encryptedData: cookieString, iv: ivString });
        db.fetchUserByEmail(email)
          .then(res => {
            const user = { id: res[0].id, username: res[0].username, email: res[0].email }
            client.emit('cookieResponse', user);
            db.fetchNotificationsByUser(user.id)
              .then(res => {
                client.emit('allNotifications', res);
              })
              .catch(error => {
                handleError(error, client);
              });
            activeUsers.addUser(user, client);
            client.on('disconnect', () => {
              activeUsers.removeUser(user.id);
            });
          })
          .catch(error => {
            handleError(error, client);
          });
      } catch (err) {
        client.emit('cookieResponse', null);
      }
    } else {
      client.emit('cookieResponse', null);
    }
  });

  client.on('registrationAttempt', (data) => {
    authenticator.register(data.username, data.email, data.password)
      .then(res => {
        delete res[0].password;
        client.emit('WelcomeYaBogeyBastard', (res[0]));
      })
      .catch(error => {
        handleError(error, client);
      });
  });

  // handles logging in and activeUsers
  client.on('loginAttempt', (data) => {
    authenticator.authenticate(data.email, data.password)
      .then(res => {
        const authenticateAttempt = res;
        if (authenticateAttempt) {

          activeUsers.addUser(authenticateAttempt, client);

          client.on('disconnect', () => {
            activeUsers.removeUser(authenticateAttempt.id);
          });
        } else {
          handleError({ type: 'login', msg: 'Email and/or password is incorrect, try again!' }, client);
        }
        if (authenticateAttempt.id) {
          const iv = crypto.randomBytes(16);

          let enc = encrypt(authenticateAttempt.email, iv);
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
    if (data.meetingId && activeMeetings[data.meetingId] && data.user.id) {
      activeMeetings[data.meetingId].userPixels[data.page][data.user.id].push(data.pixel);
      io.to(data.meetingId).emit('drawClick', data); //pass message along
    }
  });

  client.on('setPointer', data => {
    activeMeetings[data.meetingId].pointers[data.user.id] = data.pixel;
    io.to(data.meetingId).emit('setPointer', data); //pass message along
  });


  client.on('changePage', data => {
    activeMeetings[data.meetingId].initialPage = data.page;
    io.to(data.meetingId).emit('changingPage', data);
  });

  client.on('fetchUser', (data) => {
    db.fetchUserByEmail(data.email)
      .then(res => {
        user = { id: res.id, username: res.username, email: res.email };
        client.emit('user', user);
      })
      .catch(error => {
        handleError(error, client);
      });
  });

  client.on('fetchContactsByUserId', (data) => {
    db.fetchContactsByUserId(data.id, data.username)
      .then(res => {
        client.emit('contactsByUserId', res);
      })
      .catch(error => {
        handleError(error, client);
      });
  });

  client.on('fetchContactsGlobal', (data) => {
    db.fetchUsersByUsername(data.username, data.user.id)
      .then(res => {
        client.emit('contactsGlobal', res);
      })
      .catch(error => {
        handleError(error, client);
      });
  })

  client.on('fetchMeetings', (data) => {
    db.fetchMeetingsByUserId(data.username, data.meetingStatus)
      .then(res => {
        client.emit('meetings', res);
      })
      .catch(error => {
        handleError(error, client);
      });
  });

  client.on('addUser', (data) => {

    const credentials = {
      ...data
    };

    db.insertUser(credentials.username, credentials.email, credentials.password)
      .then(() => {
        client.emit('loginAttempt', credentials.username);
      })
      .catch(error => {
        handleError(error, client);
      });
  });

  const saveImages = async (files, id) => {

    let filenames = [];//Returns list of filenames
    for (const [name, file] of Object.entries(files)) {
      if (name.search(/\.pdf$/ig) !== -1) {
        fs.writeFileSync(`meeting_files/${id}/${name}`, file)
        let pdfImage = new PDFImage(`meeting_files/${id}/${name}`);
        try {
          fullImagePath = await pdfImage.convertFile();
          //Regex below converts strings like 'meeting_files/1/sample-0.png' to 'sample-0.png'
          //Looks for the last '/' in the string and matches everything until (and including) '.png'.
          imagePath = fullImagePath.map((fullpath) => fullpath.match(/(?<=\/)[^\/]*\.png/)[0]);
          filenames.push(...imagePath);
        } catch (err) {
          console.error("Error saving pdf", error);
        }

      } else {
        try {
          fs.writeFileSync(`meeting_files/${id}/${name}`, file)
          filenames.push(name);
        } catch (error) {
          handleError(error, client);
        };
      }
    }
    return filenames;
  }

  client.on('insertMeeting', async (data) => {
    try {

      res = await db.insertMeeting(data.startTime, data.ownerId, data.name, data.description, "creating", null);
      let id = res[0].id;
      fs.mkdir(`meeting_files/${id}`, async () => {
        let files = await saveImages(data.files, id);
        client.emit('newMeeting', res[0]);
        await db.updateMeetingLinksAndStatusById(id, files, data.status);
        const promiseArray = [];

        for (let contact of data.selectedContacts) {

          if (contact.id === data.ownerId) {
            promiseArray.push(db.insertUsersMeeting(contact.id, id, 'accepted'));
          } else {
            promiseArray.push(db.insertUsersMeeting(contact.id, id, null));
          }
        }

        await Promise.all(promiseArray);

        res = await db.fetchMeetingWithUsersById(id);

        for (let contactId of res[0].attendee_ids) {
          if (contactId !== data.ownerId) {
            notify(contactId, { title: 'New Meeting Invite', type: 'meeting', msg: `You have been invited to the meeting '${res[0].name}! Please RSVP`, meetingId: res[0].id, ownerId: res[0].owner_id });
          }
          if (activeUsers[contactId]) {
            activeUsers[contactId].socket.emit('itWorkedThereforeIPray', res[0]);
          }
        }
      });
    }
    catch (error) {
      handleError(error, client);
    }
  });

  client.on('startMeeting', (data) => {
    db.updateMeetingActiveState(data.id, true)
      .then(() => { // meeting status has been updated

        db.fetchMeetingById(data.id)
          .then(res => { // meeting has been retrieved
            const meeting = res[0];

            // set meeting pixel log
            meeting['link_to_initial_files'] = meeting.link_to_initial_files;
            let numPages = meeting.link_to_initial_files.length;
            meeting['userPixels'] = [];

            if (numPages === 0) { //blank canvas
              meeting['userPixels'].push(new Object()); //create a single page
            }

            for (var i = 0; i < numPages; i++) {
              meeting['userPixels'].push(new Object());
            }

            meeting['initialPage'] = 0;
            meeting['liveUsers'] = {};
            meeting['pointers'] = {};
            meeting['userColors'] = colors;
            meeting['counter'] = 0; //counts number of users currenly in user
            meeting['colorMapping'] = {};

            const attendeeIds = meeting.invited_users;

            // keep track of active meetings
            activeMeetings.addMeeting(meeting);

            // send the meeting to all users who are logged in && invited to that meeting
            for (let id of attendeeIds) {

              if (id !== meeting.owner_id) {
                notify(id, { title: 'Meeting Started', type: 'meeting', msg: `Meeting '${meeting.name}' has started!`, meetingId: meeting.id, ownerId: meeting.owner_id });
              }
              if (activeUsers[id]) {
                activeUsers[id].socket.emit(`meetingStarted${meeting.id}`, { meetingId: meeting.id, ownerId: meeting.owner_id });
              }
            }
          });
      })
      .catch(error => {
        handleError(error, client);
      });
  });

  client.on('enterMeeting', (data) => {

    activeMeetings[data.meetingId].liveUsers[data.user.id] = data.user;

    let meetingDetails = activeMeetings[data.meetingId];
    //Select a color:
    let col = meetingDetails['colorMapping'][data.user.id];
    if (!col) {
      col = meetingDetails['userColors'][(meetingDetails['counter']++) % colors.length];
      meetingDetails['colorMapping'][data.user.id] = col;
    }

    if (meetingDetails['link_to_initial_files'].length === 0) {
      if (!meetingDetails.userPixels[0][data.user.id]) {
        meetingDetails.userPixels[0][data.user.id] = [];
      }
    }

    for (let i = 0; i < meetingDetails['link_to_initial_files'].length; i++) { //for each page
      if (!meetingDetails.userPixels[i][data.user.id]) {
        meetingDetails.userPixels[i][data.user.id] = [];
      }
    }

    let images = [];
    if (meetingDetails['link_to_initial_files'].length !== 0) {
      for (let i = 0; i < meetingDetails['link_to_initial_files'].length; i++) {
        try {
          //reads the files sychronously
          images.push("data:image/jpg;base64," + fs.readFileSync(`./meeting_files/${data.meetingId}/${meetingDetails.link_to_initial_files[i]}`).toString("base64"))
        } catch { e => console.error("error reading files", e) };
      }
    } else {
      images.push("data:image/jpg;base64," + fs.readFileSync(`./default_meeting_files/defaultimage.png`).toString("base64"));
    }

    db.fetchUsersMeetingsByIds(data.user.id, data.meetingId)
      .then((res) => {
        client.emit(`enteredMeeting${meetingDetails.id}`, { meeting: meetingDetails, notes: res[0].notes, pixels: meetingDetails.userPixels, images: images });

        client.join(data.meetingId);

      }).catch(err => {
        handleError(err, client);
      });
    });

    client.on('everythingLoaded', (data) => {
      io.to(data.meetingId).emit('newParticipant', { user: data.user });
      const col = activeMeetings[data.meetingId].colorMapping[data.user.id];
      io.to(data.meetingId).emit('addUserAndColor', { user: data.user, color: col });
  });

  client.on('saveDebouncedNotes', (data) => {
    db.updateUsersMeetingsNotes(data.user.id, data.meetingId, data.notes);
  });

  // handle the end meeting event
  client.on('savingMeeting', data => {
    io.to(data.meetingId).emit('loadTheSpinnerPls');
  });

  client.on('endMeeting', (data) => {

    let meetingDetails = activeMeetings[data.meetingId];

    for (let i = 0; i < data.image.length; i++) {
      let img = 'default.png'
      if (meetingDetails['link_to_initial_files'][i]) {
        img = meetingDetails['link_to_initial_files'][i];
      }

      fs.writeFile(`meeting_files/${data.meetingId}/markup_${img}`, data.image[i].replace(/^data:image\/png;base64,/, ""), 'base64', (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    db.updateMeetingById(data.meetingId, data.endTime, false, 'past').catch((err) => console.error("Update emeting failedD", err));

    io.to(data.meetingId).emit('requestNotes', { meetingId: data.meetingId, meetingName: meetingDetails.name });

    for (let id of meetingDetails.invited_users) {
      if (activeUsers[id] && !activeMeetings[data.meetingId].liveUsers[id]) {  //if the user is online
        activeUsers[id].socket.emit('meetingEndedYouSlacker', meetingDetails.id);
        notify(id, { title: 'Meeting Ended', type: 'meeting', msg: `Meeting '${meetingDetails.name}' has ended! You may check the details in History`, meetingId: meetingDetails.id });
      }
    }

    activeMeetings.removeMeeting(data.meetingId);
  });

  client.on('notes', (data) => {
    db.updateUsersMeetingsNotes(data.user.id, data.meetingId, data.notes)
      .then(() => {
        notify(data.user.id, { title: 'Meeting Ended', type: 'meeting', msg: `Meeting '${data.meetingName}' has ended! You may check the details in History`, meetingId: data.meetingId });
        client.emit('concludedMeetingId', data.meetingId);
      }).
      catch((e) => {
        console.error(e);
      });
  });

  client.on('fetchNotes', (data) => {
    //client side code should send extensions
    db.fetchUsersMeetingsByIds(data.user.id, data.meetingId)
      .then((res) => {
        let meetingDetails = res[0];
        let images = [];
        if (data.link_to_initial_files.length === 0) {
          try {
            let image = fs.readFileSync(`meeting_files/${data.meetingId}/markup_default.png`);
            images.push("data:image/jpg;base64," + image.toString("base64"))
          } catch (err) {
            console.error("error reading files", err)
          };
        }

        for (let i = 0; i < data.link_to_initial_files.length; i++) { //replace 3 with data.extensions.length
          try {
            let image = fs.readFileSync(`meeting_files/${data.meetingId}/markup_${data.link_to_initial_files[i]}`);
            images.push("data:image/jpg;base64," + image.toString("base64"))
          } catch (err) {
            console.error("error reading files", err)
          };
        }
        client.emit('notesFetched',
          {
            usersMeetings: res[0],
            images: images
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
    db.removeNotificationById(data.id);
  });

  client.on('dismissAllNotifications', (data) => {
    db.removeNotificationsByUserId(data.userId);
  });

  client.on('dismissNotificationType', (data) => {
    db.removeNotificationsByType(data.userId, data.type);
  });

  client.on('undoLine', (data) => {

    if (activeMeetings[data.meetingId]) {
      const pixels = activeMeetings[data.meetingId].userPixels[data.page][data.user.id];

      if (pixels.length > 0) {
        while (pixels[pixels.length - 1].dragging !== false) {
          pixels.pop();

          if (!pixels[pixels.length - 1]) { // Exit if at the beginning of the array.
            break;
          }
        }
        if (pixels[pixels.length - 1] && pixels[pixels.length - 1].dragging === false) {
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
    delete activeMeetings[data.meetingId].liveUsers[data.user.id];
    client.leave(data.meetingId);

    // tell the room who left
    io.to(data.meetingId).emit('userLeft', { user: data.user, meetingId: data.meetingId });
  });

  client.on('fetchDms', (data) => {
    db.fetchDMs(data.user.id, data.recipientId)
      .then((res) => {
        client.emit('DmsFetched', res);
      }).catch(error => {
        handleError(error, client);
      });
  });

  client.on('sendDm', (data) => {
    data.time = new Date(Date.now());
    client.emit('dm', (data));

    notify(data.recipientId, { title: `New message from ${data.user.username}`, type: 'dm', msg: `${data.msg}`, senderId: data.user.id });
    if (activeUsers[data.recipientId]) {
      activeUsers[data.recipientId].socket.emit('dm', (data));
    }

    db.insertIntoDms(data.user.id, data.recipientId, data.msg, data.time);
  });
});
