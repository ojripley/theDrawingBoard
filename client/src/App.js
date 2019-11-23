import React, { useState, useEffect } from 'react';
import './App.scss';
import Box from '@material-ui/core/Box';

// COMPONENTS
import TabBar from './TabBar';
import NavBar from './NavBar';
import ActiveMeeting from './components/active/ActiveMeeting';
import Contacts from './components/contacts/Contacts';
import Dashboard from './components/dashboard/Dashboard';
import History from './components/history/History';

//Custom hooks
import { useSocket } from './hooks/useSocket'

export default function App() {
  const DASHBOARD = 'DASHBOARD';
  const HISTORY = 'HISTORY';
  const CONTACTS = 'CONTACTS';
  const [mode, setMode] = useState(DASHBOARD);

  const { socket, socketOpen } = useSocket();

  //State required for meetings (to support auto-reconnect to meetings):
  const [inMeeting, setInMeeting] = useState(false);
  const [meetingId, setMeetingId] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [meetingNotes, setMeetingNotes] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(new Image()); //Change this to "" later by def.
  const [imageLoaded, setImageLoaded] = useState(false);
  const [initialPixels, setInitialPixels] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (socketOpen) {
      socket.emit('loginAttempt', { email: 'ta@mail.com', password: 'p' });
      socket.on('loginResponse', (data) => {
        if (data.id) {
          // console.log(data);
          setUser(data);
        }
      });
      socket.on(
        'msg', data => {
          console.log(data);
        });
      //Server says client is in a meeting:
      socket.on('meeting', data => {//Could be on connect
        setInMeeting(data.inMeeting); //Can be changed by user on login
        setMeetingNotes(data.notes); //notes for the current meeting
      });
    }
  }, [socket, socketOpen]);

  console.log(user);

  if (user) {
    if (inMeeting) {
      return (
        <ActiveMeeting
          meetingId={meetingId}
          ownerId={ownerId}
          user={user}
          socket={socket}
          socketOpen={socketOpen}
          initialNotes={meetingNotes}
          setInMeeting={setInMeeting}
          setMeetingId={setMeetingId}
          imageLoaded={imageLoaded}
          backgroundImage={backgroundImage}
          setMode={setMode}
          initialPixels={initialPixels}
        />
      );
    } else {
      return (
        <Box>
          <NavBar user={user} />
          {mode === DASHBOARD &&
            <Dashboard
              socket={socket}
              socketOpen={socketOpen}
              user={user}
              setInMeeting={setInMeeting}
              setMeetingId={setMeetingId}
              setOwnerId={setOwnerId}
              setBackgroundImage={setBackgroundImage}
              setImageLoaded={setImageLoaded}
              setInitialPixels={setInitialPixels}
            />}
          {mode === HISTORY && <History socket={socket} socketOpen={socketOpen} user={user} />}
          {mode === CONTACTS && <Contacts socket={socket} socketOpen={socketOpen} user={user} />}
          <TabBar mode={mode} setMode={setMode} />
        </Box >

      );
    }
  } else {
    return (
      <h1> Replace with login page </h1>
    );

  }
}
