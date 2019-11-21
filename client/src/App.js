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
  // const LOGIN = 'LOGIN';
  const loggedIn = true;//Change this :)
  const DASHBOARD = 'DASHBOARD';
  const HISTORY = 'HISTORY';
  const CONTACTS = 'CONTACTS';
  const [mode, setMode] = useState(DASHBOARD);

  const { socket, socketOpen } = useSocket();

  //State required for meetings (to support auto-reconnect to meetings):
  const [inMeeting, setInMeeting] = useState(true);
  const [meetingNotes, setMeetingNotes] = useState("");

  useEffect(() => {
    if (socketOpen) {
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

  if (loggedIn) {
    if (inMeeting) {
      return (
        <ActiveMeeting socket={socket}
          socketOpen={socketOpen}
          initialNotes={meetingNotes}
        />
      );
    } else {
      return (
        <Box>
          <NavBar />
          {mode === DASHBOARD && <Dashboard socket={socket} socketOpen={socketOpen} />}
          {mode === HISTORY && <History socket={socket} socketOpen={socketOpen} />}
          {mode === CONTACTS && <Contacts socket={socket} socketOpen={socketOpen} />}
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
