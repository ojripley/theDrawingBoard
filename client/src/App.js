import React, { useState, useEffect } from 'react';
import './App.scss';
import ReactNotification from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css' //SASS files are located in react-notifications-component/dist/scss
import { store } from 'react-notifications-component';
import Peer from 'peerjs';

import theme from './theme/muiTheme';
import ThemeProvider from '@material-ui/styles/ThemeProvider';

// COMPONENTS
import TabBar from './components/TabBar';
import NavBar from './components/NavBar';
import Loading from './components/Loading';
import ActiveMeeting from './components/active/ActiveMeeting';
import Notifications from './components/notifications/Notifications';
import Contacts from './components/contacts/Contacts';
import Dashboard from './components/dashboard/Dashboard';
import History from './components/history/History';
import Login from './components/login/Login';
import Error from './components/Error';

//Custom hooks
import { useSocket } from './hooks/useSocket'

// top level modes
export default function App() {
  const DASHBOARD = 'DASHBOARD';
  const HISTORY = 'HISTORY';
  const CONTACTS = 'CONTACTS';
  const NOTIFICATIONS = 'NOTIFICATIONS';

  // global state
  const { socket, socketOpen } = useSocket();
  const [mode, setMode] = useState(DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState(false);
  const [error, setError] = useState(null);

  // meeting state
  const [inMeeting, setInMeeting] = useState(false);
  const [meetingId, setMeetingId] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [meetingNotes, setMeetingNotes] = useState("");
  const [initialPage, setInitialPage] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState([]); //TODO: Change to empty array - might need to contain 1 new Image()
  const [imageLoaded, setImageLoaded] = useState(false);
  const [initialPixels, setInitialPixels] = useState([]); //TODO: Change to array - array of objects
  const [pixelColor, setPixelColor] = useState({}); //actually colors
  const [user, setUser] = useState(null);
  const [notificationList, setNotificationList] = useState([]);
  const [initialExpandedMeeting, setInitialExpandedMeeting] = useState(false);
  const [usersInMeeting, setUsersInMeeting] = useState({});

  // webrtc state

  const [peer, setPeer] = useState(null);
  const [streams, setStreams] = useState({});
  const [calls, setCalls] = useState({});
  const [newCall, setNewCall] = useState({
    newPeer: null,
    isCaller: false
  });

  // top level error listener
  useEffect(() => {
    if (socketOpen) {
      socket.on('somethingWentWrong', (data) => {
        const error = data;

        // if there is an error, set state according to type
        if (error.type === 'login') {
          setLoginError({
            type: error.type,
            msg: error.msg
          });
        } else {
          setError({
            type: error.type,
            msg: error.msg
          });
        }
      });
    }

    return () => {
      if (socketOpen) {
        socket.off('somethingWentWrong');
      }
    }
  }, [error, socket, socketOpen, loginError]);

  // set peer Object on enter meeting
  useEffect(() => {
    if (user && inMeeting) {
      setPeer(new Peer('theDrawingBoard' + String(user.id), { key: 'peerjs' }));
    }
  }, [user, inMeeting, setPeer]);

  // set up listeners for new calls and new participans
  useEffect(() => {
    if (peer && inMeeting) {

      // uncomment for PeerServer id acknowledgement
      // peer.on('open', (id) => {
      //   console.log('PeerServer thinks i am:', id);
      // });

      // listen for incoming calls
      peer.on('call', (call) => {
        const callerId = call.peer;
        setCalls(prev => ({
          ...prev,
          [callerId]: call
        }));
        setNewCall({
          newPeer: callerId,
          isCaller: false
        });
      });

      // listen for new users joining
      if (socketOpen && !newCall.newPeer) {
        socket.on('newParticipant', (data) => {
          const liveUserId = 'theDrawingBoard' + data.user.id;
          setUsersInMeeting(prev => ({
            ...prev,
            [liveUserId]: data.user
          }));

          // if user is not yourself, start call with them
          if (data.user.id !== user.id) {
            const peerId = 'theDrawingBoard' + data.user.id;

            navigator.mediaDevices.getUserMedia({ video: false, audio: true })
              .then((stream) => {
                const call = peer.call(String(peerId), stream);

                setCalls(prev => ({
                  ...prev,
                  [peerId]: call
                }));
                setNewCall({
                  newPeer: peerId,
                  isCaller: true
                });
              }, (error) => {
                console.log('Failed to get User Media. User must allow access to microphone for audio calling.');
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
  }, [peer, streams, socket, socketOpen, user, inMeeting, newCall.newPeer, calls]);


  // handle new call connections
  useEffect(() => {
    if (peer && newCall.newPeer && inMeeting) {

      // handle all calls where you are the initiator
      if (newCall.isCaller) {

        if (calls[newCall.newPeer]) {
          // wait for other user to accept getUserMedia
          calls[newCall.newPeer].on('stream', (incomingStream) => {

            // there is no appropriate way to add audio streams to elements in React
            // direct DOM manipulation was the next best thing
            const root = document.getElementById('root');
            const audioStream = document.createElement('audio');
            audioStream.setAttribute('id', `stream${newCall.newPeer}`);
            audioStream.setAttribute('class', 'hide-audio-controls');
            audioStream.setAttribute('autoPlay', true);
            audioStream.setAttribute("playsinline", true);
            audioStream.setAttribute("controls", true);
            audioStream.setAttribute('display', 'none');
            root.prepend(audioStream);
            audioStream.srcObject = incomingStream;

            setStreams(prev => ({
              ...prev,
              [newCall.newPeer]: incomingStream
            }));
            setNewCall({
              newPeer: null,
              isCaller: false
            });
          });
        }

      } else { // the user is the receiver of a new call

        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
          .then((stream) => {
            console.log('got stream');
            calls[newCall.newPeer].answer(stream);
            calls[newCall.newPeer].on('stream', (incomingStream) => {

              // there is no appropriate way to add audio streams to elements in React
              // direct DOM manipulation was the next best thing
              const root = document.getElementById('root');
              const audioStream = document.createElement('audio');
              audioStream.setAttribute('id', `stream${newCall.newPeer}`);
              audioStream.setAttribute('class', 'hide-audio-controls');
              audioStream.setAttribute('autoPlay', true);
              audioStream.setAttribute("playsinline", true);
              audioStream.setAttribute("controls", true);
              audioStream.setAttribute('display', 'none');
              root.prepend(audioStream);
              audioStream.srcObject = incomingStream;

              setStreams(prev => ({
                ...prev,
                [newCall.newPeer]: incomingStream
              }));
              setNewCall({
                newPeer: null,
                isCaller: false
              });
            });
          }, (error) => {
              console.log('Failed to get User Media. User must allow access to microphone for audio calling.');
          });
      }
    }
  }, [inMeeting, peer, calls, newCall]);

  // clean up calls/peer object when user leaves the meeting
  useEffect(() => {
    if (peer && !inMeeting) {
      setStreams({});
      setCalls({});
      peer.destroy();
      setPeer(null);
      setNewCall({
        newPeer: null,
        isCaller: false
      });

      const streamElements = document.querySelectorAll('audio');

      for (let el of streamElements) {
        console.log(el);
        el.parentNode.removeChild(el);
      }
    }
  }, [peer, inMeeting, streams, calls, newCall, setPeer]);

  // listen for users to leave the meeting
  useEffect(() => {
    if (socketOpen) {
      socket.on('userLeft', (data) => {
        const liveUserId = 'theDrawingBoard' + data.user.id;

        const tempUsersInMeeting = usersInMeeting;

        delete tempUsersInMeeting[liveUserId];

        // this will trigger the userChips to rerender
        setUsersInMeeting({ ...tempUsersInMeeting });

        // this is for cleaning up stream for the disconnected user
        console.log('closing stream');

        //  call cleanup
        const tempStreams = streams;
        const tempCalls = calls;

        delete tempStreams[liveUserId];
        delete tempCalls[liveUserId];

        setStreams(tempStreams);
        setCalls(tempCalls);

        console.log('streams', streams);
        console.log('calls', calls);

        setNewCall({
          newPeer: null,
          isCaller: false
        });

        const peerStream = document.querySelectorAll(`#stream${liveUserId}`);

        for (let el of peerStream) {
          console.log(el);
          el.parentNode.removeChild(el);
        }
      });

      return () => {
        socket.off('userLeft');
      }
    }
  }, [usersInMeeting, socket, socketOpen, calls, streams]);

  useEffect(() => {
    if (socketOpen) {
      if (!user) {
        socket.emit('checkCookie', document.cookie);
      }

      socket.on('allNotifications', data => {
        console.log(data);

        setNotificationList(data);
      });

      socket.on('notify', data => {
        if (!inMeeting && !loading) {
          console.log("Setting notification");
          setNotificationList(prev => [data, ...prev]);
          store.addNotification({
            title: `${data.type}`,
            message: `${data.msg}`,
            type: "custom",
            insert: "top",
            container: "top-right",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
              duration: 4000,
              onScreen: true,
              click: true
            }
          });
        }
      })

      socket.on('cookieResponse', data => {
        console.log('received cookie response');
        setLoading(false);
        setUser(data);
        setMode(DASHBOARD)
      });

      return () => {
        socket.off('notify');
        socket.off('cookieResponse');
        socket.off('meeting');
      }
    }
  }, [socket, socketOpen, setLoading, loading, inMeeting, user]);


  return (
    <>
      {error && <ThemeProvider theme={theme}><Error error={error} /></ThemeProvider>}
      {loading && <ThemeProvider theme={theme}><Loading /></ThemeProvider>}
      <ThemeProvider theme={theme}>
        {!inMeeting && <NavBar user={user} setUser={setUser} setMode={setMode} setLoading={setLoading} />}
        {!user ?
          <Login setUser={setUser} socket={socket} socketOpen={socketOpen} setLoginError={setLoginError} error={loginError} />
          : inMeeting ?
            <>
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
                setImageLoaded={setImageLoaded}
                backgroundImage={backgroundImage}
                setBackgroundImage={setBackgroundImage}
                setMode={setMode}
                initialPixels={initialPixels}
                setLoading={setLoading}
                pixelColor={pixelColor}
                usersInMeeting={usersInMeeting}
                setUsersInMeeting={setUsersInMeeting}
                initialPage={initialPage}
              />
            </>
            : <>
              <div id='app-container'>
                <ReactNotification
                  isMobile={true}
                  breakpoint={2000}
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
                    setUsersInMeeting={setUsersInMeeting}
                    setInitialPage={setInitialPage}
                  />}
                {mode === HISTORY && <History socket={socket} socketOpen={socketOpen} user={user} />}
                {mode === CONTACTS && <Contacts socket={socket} socketOpen={socketOpen} user={user} setError={setError}/>}
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
