import React, { useState, useEffect } from 'react';
import './App.scss';
import Container from '@material-ui/core/Box';
import ReactNotification from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css' //SASS files are located in react-notifications-component/dist/scss
import { store } from 'react-notifications-component';

import theme from './theme/muiTheme';
import ThemeProvider from '@material-ui/styles/ThemeProvider';


// COMPONENTS
import TabBar from './TabBar';
import NavBar from './NavBar';
import ActiveMeeting from './components/active/ActiveMeeting';
import Notifications from './components/notifications/Notifications';
import Contacts from './components/contacts/Contacts';
import Dashboard from './components/dashboard/Dashboard';
import History from './components/history/History';
import Login from './components/login/Login';

//Custom hooks
import { useSocket } from './hooks/useSocket'

export default function App() {
  const DASHBOARD = 'DASHBOARD';
  const HISTORY = 'HISTORY';
  const CONTACTS = 'CONTACTS';
  const NOTIFICATIONS = 'NOTIFICATIONS';
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
  const [notificationList, setNotificationList] = useState(
    [
      {
        id: 1,
        type: "meeting",
        title: "example",
        message: "onetwothree",
        timestamp: (new Date()).toLocaleDateString()
      },
      {
        id: 2,
        type: "meeting",
        title: "example2",
        message: "onetwothree",
        timestamp: (new Date()).toLocaleDateString()
      },
      {
        id: 3,
        type: "meeting",
        title: "example3",
        message: "onetwothree",
        timestamp: (new Date()).toLocaleDateString()
      },
      {
        id: 4,
        type: "contacts",
        title: "new contact",
        message: "you have a new contact",
        timestamp: (new Date()).toLocaleDateString()
      },
      {
        id: 5,
        type: "contacts",
        title: "accepted your friend request",
        message: "onetwothree",
        timestamp: (new Date()).toLocaleDateString()
      },
      {
        id: 6,
        type: "dm",
        title: "OJ",
        message: "Has dmd you",
        timestamp: (new Date()).toLocaleDateString()
      },
      {
        id: 7,
        type: "dm",
        title: "blah",
        message: "what's up",
        timestamp: (new Date()).toLocaleDateString()
      },

    ])
    ;


  useEffect(() => {
    if (socketOpen) {
      console.log('checking for cookie')
      socket.emit('checkCookie');
      //Server says client is in a meeting:
      socket.on('meeting', data => {//Could be on connect
        setInMeeting(data.inMeeting); //Can be changed by user on login
        setMeetingNotes(data.notes); //notes for the current meeting
      });

      socket.on('notify', data => {
        console.log(data);

        store.addNotification({
          title: `${data.type}`,
          message: `${data.msg}`,
          type: "success",
          insert: "top",
          container: "top-right",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 100000,
            onScreen: true
          }
        });
      })

      socket.on('cookieResponse', data => {
        console.log('received cookie', data);
        setUser(data[0]);
      });





      return () => {
        socket.off('cookieResponse');
        socket.off('meeting');
      }
    }
  }, [socket, socketOpen]);

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
          setMeetingNotes={setMeetingNotes}
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
        <ThemeProvider theme={theme}>
          <ReactNotification />
          <NavBar user={user} setUser={setUser} setMode={setMode}/>
          <Container>

            {mode === DASHBOARD &&
              <Dashboard
                socket={socket}
                socketOpen={socketOpen}
                user={user}
                setInMeeting={setInMeeting}
                setMeetingId={setMeetingId}
                setMeetingNotes={setMeetingNotes}
                setOwnerId={setOwnerId}
                setBackgroundImage={setBackgroundImage}
                setImageLoaded={setImageLoaded}
                setInitialPixels={setInitialPixels}
              />}
            {mode === HISTORY && <History socket={socket} socketOpen={socketOpen} user={user} />}
            {mode === CONTACTS && <Contacts socket={socket} socketOpen={socketOpen} user={user} />}
            {mode === NOTIFICATIONS &&
              <Notifications
                socket={socket}
                socketOpen={socketOpen}
                user={user}
                notificationList={notificationList}
                setNotificationList={setNotificationList}
                setMode={setMode}
              />}

          </Container>
          <TabBar mode={mode} setMode={setMode} notificationList={notificationList} />
        </ThemeProvider>

      );
    }
  } else {
    return (
      <Container>
        <NavBar user={null} />
        <Login setUser={setUser} socket={socket} socketOpen={socketOpen} />
      </Container>
    );

  }
}
