import React, { useState, useEffect } from 'react';
import './App.scss';
import ReactNotification from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css' //SASS files are located in react-notifications-component/dist/scss
import { store } from 'react-notifications-component';
import Peer from 'peerjs';

import theme from './theme/muiTheme';
import ThemeProvider from '@material-ui/styles/ThemeProvider';

// COMPONENTS
import TabBar from './TabBar';
import NavBar from './NavBar';
import Loading from './components/Loading';
import ActiveMeeting from './components/active/ActiveMeeting';
import Notifications from './components/notifications/Notifications';
import Contacts from './components/contacts/Contacts';
import Dashboard from './components/dashboard/Dashboard';
import History from './components/history/History';
import Login from './components/login/Login';
import AudioPlayer from './AudioPlayer';

//Custom hooks
import { useSocket } from './hooks/useSocket'
import { usePeer } from './hooks/usePeer';

export default function App() {
  const DASHBOARD = 'DASHBOARD';
  const HISTORY = 'HISTORY';
  const CONTACTS = 'CONTACTS';
  const NOTIFICATIONS = 'NOTIFICATIONS';
  const [mode, setMode] = useState(DASHBOARD);
  const [loading, setLoading] = useState(true);

  const { socket, socketOpen } = useSocket();

  //State required for meetings (to support auto-reconnect to meetings):
  const [inMeeting, setInMeeting] = useState(false);
  const [meetingId, setMeetingId] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [meetingNotes, setMeetingNotes] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(new Image()); //Change this to "" later by def.
  const [imageLoaded, setImageLoaded] = useState(false);
  const [initialPixels, setInitialPixels] = useState({});
  const [pixelColor, setPixelColor] = useState({}); //actually colors
  const [user, setUser] = useState(null);
  const [notificationList, setNotificationList] = useState([]);
  const [initialExpandedMeeting, setInitialExpandedMeeting] = useState(false);

  useEffect(() => {
    console.log('loading', loading)
  }, [loading]);

  // webrtc related state
  const { peer, setPeer } = usePeer();
  const [newPeer, setNewPeer] = useState(null);
  const [streams, setStreams] = useState({});
  const [calls, setCalls] = useState({});
  const [newCall, setNewCall] = useState(null);
  const [isCaller, setIsCaller] = useState(null);

  useEffect(() => {
    if (user && inMeeting) {
      console.log('im making a new peer');
      // assign the user a Peer object when they join the meeting
      setPeer(new Peer(String(user.id), { key: 'peerjs' }));
    }
  }, [user, inMeeting]);

  useEffect(() => {

    // make sure the user has been assigned a Peer object
    if (peer) {
      console.log('i am peer', peer);

      peer.on('open', (id) => {
        console.log('PeerServer thinks i am:', id);
      });

      // listen for incoming calls
      peer.on('call', (call) => {

        const callerId = call.peer;

        setIsCaller(false);
        setNewCall(callerId);
        setCalls(prev => ({
          ...prev,
          [callerId]: call
        }));
      });

      if (socketOpen) {
        // when someone new joins
        socket.on('newParticipant', (data) => {

          // log who that is
          console.log('new user', data.user.username);

          // make sure it isn't yourself
          if (data.user.id !== user.id) {

            // assign the new user's id to use as a peerId
            const peerId = data.user.id;

            // start an audio call with them
            console.log('asking for media');
            navigator.mediaDevices.getUserMedia({ video: false, audio: true })
              .then((stream) => {
                console.log('this is my media stream, now waiting on answer', stream);
                const call = peer.call(String(peerId), stream);
                setIsCaller(true);
                setNewCall(peerId);
                setCalls(prev => ({
                  ...prev,
                  [peerId]: call
                }));
              }, (error) => {
                console.error('Failed to get media stream', error);
              });
          }
        });
      }
    }
    return () => {
      if (socketOpen) {
        socket.off('newParticipant');
      }
    }
  }, [peer, streams]);


  useEffect(() => {
    if (peer && newCall && inMeeting) {
      if (isCaller) {
        console.log('new call is with', newCall);
        console.log(calls);
        calls[newCall].on('stream', (incomingStream) => {
          // play audio
          console.log('adding stream to state');
          setStreams(prev => ({
            ...prev,
            [newCall]: incomingStream
          }));
          console.log('this is where you play audio');
        });

      } else if (!newPeer) { // the user is the receiver

        console.log('someone is calling me');

        // answer the call. Uncle Same needs YOU!
        console.log('answering the call');
        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
          .then((stream) => {
            console.log('got stream');
            calls[newCall].answer(stream);
            calls[newCall].on('stream', (incomingStream) => {
              console.log('adding stream to state');
              setStreams(prev => ({
                ...prev,
                [newCall]: incomingStream
              }));
            });
          }, (error) => {
            console.error('Failed to get media stream');
          });
      }
    } else if (peer && !inMeeting) {
      console.log('deleting the peer');
      console.log('my streams', streams);
      setStreams({});
      setCalls({});
      peer.destroy();
      setPeer(null);
      console.log('streams after delete', streams);
    }

  }, [calls, inMeeting]);

  useEffect(() => {
    if (socketOpen) {
      socket.on('userLeft', (data) => {
        console.log('user has left', data.user.username);

        const tempStreams = streams;

        console.log('removing call with', data.user.username);
        console.log(streams);
        console.log(tempStreams[data.user.id]);
        delete tempStreams[data.user.id];
        setNewPeer(null);
        setStreams(tempStreams);

        console.log('calls', calls);

        // var elem = document.querySelector('#some-element');
        // elem.parentNode.removeChild(elem);

      });
    }

    return () => {
      if (socketOpen) {
        socket.off('useLeft');
      }
    }
  }, [socket, socketOpen]);

  useEffect(() => {
    console.log('my streams have changed', streams);

  }, [streams]);






  useEffect(() => {
    if (socketOpen) {
      socket.emit('checkCookie');
      //Server says client is in a meeting:
      socket.on('meeting', data => {//Could be on connect
        setInMeeting(data.inMeeting); //Can be changed by user on login
        setMeetingNotes(data.notes); //notes for the current meeting
      });

      socket.on('allNotifications', data => {
        console.log(data);

        setNotificationList(data);
      });

      socket.on('notify', data => {
        console.log(data);

        setNotificationList(prev => [...prev, data]);

        store.addNotification({
          title: `${data.type}`,
          message: `${data.msg}`,
          type: "custom",
          insert: "top",
          container: "top-right",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 2000,
            onScreen: true
          }
        });
      })

      socket.on('cookieResponse', data => {
        console.log('received cookie response')
        setLoading(false);
        setUser(data);
      });

      return () => {
        socket.off('cookieResponse');
        socket.off('meeting');
      }
    }
  }, [socket, socketOpen, setLoading]);

  const incomingStreams = Object.keys(streams).map((key) => {
    const stream = streams[key];
    return (
      <AudioPlayer
        key={key}
        stream={stream}></AudioPlayer>
    )
  })

  return (
    <>
      {loading && <ThemeProvider theme={theme}><div></div><Loading /></ThemeProvider>}
      <ThemeProvider theme={theme}>
        {!inMeeting && <NavBar user={user} setUser={setUser} setMode={setMode} setLoading={setLoading} />}

        {!user ?
          <Login setUser={setUser} socket={socket} socketOpen={socketOpen} />
          : inMeeting ?
          <>
            <div>{incomingStreams}</div>
            <ActiveMeeting
            meetingId={meetingId}
            ownerId={ownerId}
            user={user}
            socket={socket}
            socketOpen={socketOpen}
            initialNotes={meetingNotes}
            setMeetingNotes={setMeetingNotes}
                setInMeeting={setInMeeting}
                inMeeting={inMeeting}
                setMeetingId={setMeetingId}
                imageLoaded={imageLoaded}
                setImageLoaded={setImageLoaded}
                backgroundImage={backgroundImage}
                setBackgroundImage={setBackgroundImage}
                setMode={setMode}
                initialPixels={initialPixels}
                setLoading={setLoading}
                pixelColor={pixelColor}
              />
            </>
            : <>
              <div id='app-container'>
                <ReactNotification
                  types={[{
                    htmlClasses: ['notification-custom'],
                    name: 'custom'
                  }]}
                />
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
                    loading={loading}
                    setLoading={setLoading}
                    setPixelColor={setPixelColor}
                    initialExpandedMeeting={initialExpandedMeeting}
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
                    setInitialExpandedMeeting={setInitialExpandedMeeting}
                  />}

              </div>
              <TabBar mode={mode} setMode={setMode} notificationList={notificationList} />
            </>
        }
      </ThemeProvider>
    </>
  )
}
