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
import Error from './components/Error';

//Custom hooks
import { useSocket } from './hooks/useSocket'
import { usePeer } from './hooks/usePeer';

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
  const { peer, setPeer } = usePeer();
  const [streams, setStreams] = useState({});
  const [calls, setCalls] = useState({});
  const [incomingStreams, setIncomingStreams] = useState({});
  const [newCall, setNewCall] = useState({
    newPeer: null,
    isCaller: false
  });

  useEffect(() => {
    console.log('loading', loading);
  }, [loading]);

  useEffect(() => {
    if (socketOpen) {
      console.log('listening for error');
      socket.on('somethingWentWrong', (data) => {
        const error = data;
        console.log(error);
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


  // set peer on enter meeting
  useEffect(() => {
    if (user && inMeeting) {
      // console.log('im making a new peer');
      // assign the user a Peer object when they join the meeting
      setPeer(new Peer('theDrawingBoard' + String(user.id), { key: 'peerjs' }));
    }
  }, [user, inMeeting, setPeer]);

  // set up listeners for new calls and new participans
  useEffect(() => {
    console.log('i am peer', peer);

    // make sure the user has been assigned a Peer object and they are in a meeting
    if (peer && inMeeting) {

      // listening for PeerServer
      peer.on('open', (id) => {
        console.log('PeerServer thinks i am:', id);
      });

      console.log('i am listening for calls');
      // listen for incoming calls
      peer.on('call', (call) => {

        console.log('someone is calling me, time to accept', call.peer);

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

      console.log('i want to listen for new users', newCall.newPeer);
      if (socketOpen && !newCall.newPeer) {
        // when someone new joins
        console.log('im listening for new users');
        socket.on('newParticipant', (data) => {
          // setNewParticipant(true);

          // log who that is
          console.log('new user', data.user.username);

          const liveUserId = 'theDrawingBoard' + data.user.id;

          // add that user to the active people in the meeting
          setUsersInMeeting(prev => ({
            ...prev,
            [liveUserId]: data.user
          }));

          // make sure it isn't yourself
          if (data.user.id !== user.id) {
            // if (sentCall !== data.user.id);

            console.log('new user is not me, i am going to call', data.user.username);

            // assign the new user's id to use as a peerId
            const peerId = 'theDrawingBoard' + data.user.id;

            // start an audio call with them
            navigator.mediaDevices.getUserMedia({ video: false, audio: true })
              .then((stream) => {
                console.log('this is my media stream, now waiting on answer', stream);
                const call = peer.call(String(peerId), stream);
                console.log('new call', call);
                setCalls(prev => ({
                  ...prev,
                  [peerId]: call
                }));
                setNewCall({
                  newPeer: peerId,
                  isCaller: true
                });
              }, (error) => {
                console.error('Failed to get media stream', error);
              });
          } else {
            console.log('user is me, disregard');
          }
        });
      }
    }
    return () => {
      if (socketOpen) {
        socket.off('newParticipant');
      }
    }
  }, [peer, streams, socket, socketOpen, user, inMeeting, newCall.newPeer, calls]); // newParticipant


  // handle new call connections
  useEffect(() => {
    // console.log('newPeer', newCall.newPeer);
    // console.log('isCaller', newCall.isCaller);
    if (peer && newCall.newPeer && inMeeting) {

      if (newCall.isCaller) { // && !sentCall

        console.log('new call is with', newCall.newPeer);
        console.log(calls);
        if (calls[newCall.newPeer]) {
          console.log('hey, the call exists, waiting for answer stream');
          calls[newCall.newPeer].on('stream', (incomingStream) => {

            // create a stream element
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

            console.log('adding stream to state');
            setStreams(prev => ({
              ...prev,
              [newCall.newPeer]: incomingStream
            }));
            console.log('cleaning up state to reset for new users');
            setNewCall({
              newPeer: null,
              isCaller: false
            });
          });
        }

      } else { // the user is the receiver of a new call

        // answer the call. Uncle Sam needs YOU!
        console.log('answering the call');
        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
          .then((stream) => {
            console.log('got stream');
            calls[newCall.newPeer].answer(stream);
            calls[newCall.newPeer].on('stream', (incomingStream) => {


              // create a stream element
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


              console.log('adding stream to state');
              setStreams(prev => ({
                ...prev,
                [newCall.newPeer]: incomingStream
              }));
              console.log('cleaning up state to reset for new users');
              setNewCall({
                newPeer: null,
                isCaller: false
              });
            });
          }, (error) => {
            console.error('Failed to get media stream', error);
          });
      }
    }
  }, [inMeeting, peer, calls, newCall]);

  // clean up calls/peer object when user leaves the meeting
  useEffect(() => {
    if (peer && !inMeeting) {

      console.log('deleting the peer');
      console.log('my streams', streams);
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

  useEffect(() => {
    if (socketOpen) {
      // console.log('listening for users to leave');
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
      {error && <ThemeProvider theme={theme}><div></div><Error error={error} /></ThemeProvider>}
      {loading && <ThemeProvider theme={theme}><div></div><Loading /></ThemeProvider>}
      <ThemeProvider theme={theme}>
        {!inMeeting && <NavBar user={user} setUser={setUser} setMode={setMode} setLoading={setLoading} />}

        {!user ?
          <Login setUser={setUser} socket={socket} socketOpen={socketOpen} setLoginError={setLoginError} error={loginError} />
          : inMeeting ?
            <>
              {/* <div>{incomingStreams}</div> */}
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
