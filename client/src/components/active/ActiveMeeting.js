import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import Canvas from './Canvas';
import useDebounce from '../../hooks/useDebounce';

import { usePeer } from '../../hooks/usePeer';
import { useConnections } from '../../hooks/useConnections';

import { makeStyles } from '@material-ui/core/styles';
import InputIcon from '@material-ui/icons/Input';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import CircularProgress from '@material-ui/core/CircularProgress';

import CanvasDrawer from './CanvasDrawer';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  fab: {
    margin: theme.spacing(1),
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 3
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  textareaAutosize: {
    resize: 'none',
    width: '50%',
    marginRight: '1em'
  },
  center: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    position: 'absolute',
    zIndex: 2,
    bottom: 20,
    width: "100%",
  },
  saving: {
    position: 'absolute',
    width: 100,
    height: 100,
    bottom: 20,
    left: 50,
    zIndex: 3,
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(1),
      width: 100,
      height: 100
    }
  }
}));

export default function ActiveMeeting({ socket, socketOpen, initialNotes, user, meetingId, setInMeeting, ownerId, setMeetingId, setMode, imageLoaded, backgroundImage, initialPixels }) {

  const classes = useStyles();

  // const [imageLoaded, setLoaded] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState(initialNotes || '');
  const [writeMode, setWriteMode] = useState(false);
  const [saving, setSaving] = useState(true);
  const debouncedNotes = useDebounce(meetingNotes, 400);

  const textareaRef = useRef(null);

  // webrtc related state
  const { peer, setPeer } = usePeer();
  const { connections, setConnections } = useConnections();
  const [newPeer, setNewPeer] = useState(null);
  const [isInitiator, setIsInitiator] = useState(null);
  const [stream, setStream] = useState(null);
  const [calls, setCalls] = useState({});
  const [newCall, setNewCall] = useState(null);
  const [isCaller, setIsCaller] = useState(null);




  // this version gets the stream once on user entry
  useEffect(() => {
    // assign the user a Peer object when they join the meeting
    setPeer(new Peer(String(user.id), { key: 'peerjs' }));
    console.log('getting media');
    navigator.mediaDevices.getUserMedia({ video: false, audio: true }, (audioStream) => {
      console.log('got media');
      console.log('my stream', audioStream);
      setStream(audioStream);
    }, (error) => {
      console.log('error getting media', error);
      console.error('Failed to get media stream', error);
    });
  }, []);

  useEffect(() => {

    // make sure the user has been assigned a Peer object
    if (peer) {
      console.log('i am peer', peer);

      peer.on('open', (id) => {
        console.log('PeerServer thinks i am:', id);
      });

      // listen for peers connecting to you
      peer.on('connection', (conn) => {
        console.log('someone is connecting to me');
        console.log(conn.peer);
        const peerId = conn.peer;

        // setting the state needing for opening connections in useEffect
        setIsInitiator(false);
        setNewPeer(peerId);
        setConnections(prev => ({
          ...prev,
          [peerId]: conn
        }));
      });

      // listen for incoming calls
      peer.on('call', (call) => {

        console.log('someone is calling me');

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

            // start a connection with them
            console.log('i am trying to start a connection with', peerId);
            const conn = peer.connect(String(peerId));

            // setting the state needing for opening connections in third useEffect
            setIsInitiator(true);
            setNewPeer(peerId);
            setConnections(prev => ({
              ...prev,
              [peerId]: conn
            }));

            // start an audio call with them
            const call = peer.call(String(peerId), stream);

            setIsCaller(true);
            setNewCall(peerId);
            setCalls(prev => ({
              ...prev,
              [peerId]: call
            }));
          }
        });
      }
    }
    return () => {
      socket.off('newParticipant');
    }
  }, [peer]);


  useEffect(() => {
    if (peer && newCall) {
      if (isCaller) {
        console.log('new call is with', newCall);
        console.log(calls);
        calls[newCall].on('stream', (incomingStream) => {
          // play audio
          console.log('this is where you play audio');
        });

      } else { // the user is the receiver

        console.log('someone is calling me');

        // answer the call. Uncle Same needs YOU!
        console.log('answering the call');
        calls[newCall].answer(stream);
        calls[newCall].on('stream', (incomingStream) => {
          console.log('this is where you play audio');
          // play audio
        });
      }
    }
  }, [calls]);





















  // THIS VERSION DOES NOT USE MEDIA AS STATE => GETS IT EVERY TIME A CALL IS MADE

  // useEffect(() => {
  //   // assign the user a Peer object when they join the meeting
  //   setPeer(new Peer(String(user.id), {key: 'peerjs'}));
  //   // navigator.mediaDevices.getUserMedia({ video: false, audio: true }, (audioStream) => {
  //   //   setStream(audioStream);
  //   // }, (error) => {
  //   //   console.error('Failed to get media stream');
  //   // });
  // }, []);

  // useEffect(() => {

  //   // make sure the user has been assigned a Peer object
  //   if (peer) {
  //     console.log('i am peer', peer);

  //     peer.on('open', (id) => {
  //       console.log('PeerServer thinks i am:', id);
  //     });

  //     // listen for peers connecting to you
  //     peer.on('connection', (conn) => {
  //       console.log('someone is connecting to me');
  //       console.log(conn.peer);
  //       const peerId = conn.peer;

  //       // setting the state needing for opening connections in useEffect
  //       setIsInitiator(false);
  //       setNewPeer(peerId);
  //       setConnections(prev => ({
  //         ...prev,
  //         [peerId]: conn
  //       }));
  //     });

  //     // listen for incoming calls
  //     peer.on('call', (call) => {

  //       const callerId = call.peer;

  //       setIsCaller(false);
  //       setNewCall(callerId);
  //       setCalls(prev => ({
  //         ...prev,
  //         [callerId]: call
  //       }));
  //     });

  //     if (socketOpen) {
  //       // when someone new joins
  //       socket.on('newParticipant', (data) => {

  //         // log who that is
  //         console.log('new user', data.user.username);

  //         // make sure it isn't yourself
  //         if (data.user.id !== user.id) {

  //           // assign the new user's id to use as a peerId
  //           const peerId = data.user.id;

  //           // start a connection with them
  //           console.log('i am trying to start a connection with', peerId);
  //           const conn = peer.connect(String(peerId));

  //           // setting the state needing for opening connections in third useEffect
  //           setIsInitiator(true);
  //           setNewPeer(peerId);
  //           setConnections(prev => ({
  //             ...prev,
  //             [peerId]: conn
  //           }));

  //           // start an audio call with them
  //           console.log('asking for media');
  //           navigator.mediaDevices.getUserMedia({ video: false, audio: true }, (stream) => {
  //             console.log('this is my media stream, now waiting on answer', stream);
  //             const call = peer.call(String(peerId), stream);
  //             setIsCaller(true);
  //             setNewCall(peerId);
  //             setCalls(prev => ({
  //               ...prev,
  //               [peerId]: call
  //             }));
  //           }, (error) => {
  //             console.error('Failed to get media stream', error);
  //           });


  //         }
  //       });
  //     }
  //   }
  //   return () => {
  //     socket.off('newParticipant');
  //   }
  // }, [peer]);


  // useEffect(() => {
  //   if (peer && newCall) {
  //     if (isCaller) {
  //       console.log('new call is with', newCall);
  //       console.log(calls);
  //       calls[newCall].on('stream', (incomingStream) => {
  //         // play audio
  //         console.log('this is where you play audio');
  //       });

  //     } else { // the user is the receiver

  //       console.log('someone is calling me');

  //       // answer the call. Uncle Same needs YOU!
  //       console.log('answering the call');
  //       navigator.mediaDevices.getUserMedia({ video: false, audio: true }, (stream) => {
  //         console.log('got stream');
  //         calls[newCall].answer(stream);
  //         calls[newCall].on('stream', (incomingStream) => {
  //           console.log('this is where you play audio');
  //             // play audio
  //           });
  //       }, (error) => {
  //         console.error('Failed to get media stream');
  //       });
  //     }
  //   }
  // }, [calls]);


  useEffect(() => {

    // if user is a peer and a new connection has been made with a newPeer
    if (peer && newPeer) {

      // if the user is the initiator of the connection
      if (isInitiator) {

        // set a listener for when their initiated P2P connection has been opened
        connections[newPeer].on('open', () => {

          console.log('connection open');
          connections[newPeer].send(`Hello from peer ${user.username}`);

          // open a listener to recieve data from the peers
          connections[newPeer].on('data', (data) => {
            console.log(data);
          });
        });

      } else { // if the user is the receiver of the connection

        // set a listener for when the received P2P connection has been opened
        connections[newPeer].on('open', () => {

          // set a listener for recieving data from the peer
          connections[newPeer].on('data', (data) => {
            console.log(data);
          });
          connections[newPeer].send(`Hello from peer ${user.username}`);
        });
      }
      console.log('connections:', connections);
    }
  }, [connections]);

  const handleInput = (e) => {
    console.log(e.target.value)
    setMeetingNotes(e.target.value);
    setSaving(true);
  }

  const handleCaret = e => {
    var temp_value = e.target.value
    e.target.value = ''
    e.target.value = temp_value
  }

  useEffect(() => {
    socket.on('requestNotes', res => {
      socket.emit('notes', { user: user, meetingId: meetingId, notes: meetingNotes });
    });
    socket.on('concludedMeetingId', res => {
      setInMeeting(false);
      setMeetingId(null);
    })
    return () => {
      socket.off('requestNotes');
      socket.off('concludedMeetingId');
    };
  }, [socket, setInMeeting, debouncedNotes, meetingId, meetingNotes, setMeetingId, user])

  useEffect(() => {
    if (socketOpen) {
      console.log('requesting note save');
      socket.emit('saveDebouncedNotes', { user: user, meetingId: meetingId, notes: debouncedNotes });
      setSaving(false);
    }
  }, [socket, socketOpen, debouncedNotes, user, meetingId])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [ writeMode])

  return (
    imageLoaded &&
    <div className={classes.root}>
      <CanvasDrawer
        user={user}
        socket={socket}
        socketOpen={socketOpen}
        meetingId={meetingId}
        setMode={setMode}
        setInMeeting={setInMeeting}
        setWriteMode={setWriteMode}
      />
      <Canvas
        user={user}
        ownerId={ownerId}
        socket={socket}
        socketOpen={socketOpen}
        imageEl={backgroundImage}
        isLoaded={imageLoaded}
        meetingId={meetingId}
        initialPixels={initialPixels}
      />
      {writeMode &&
        <div className={classes.center}>
          <TextareaAutosize
            ref={textareaRef}
            aria-label='empty textarea'
            placeholder='Empty'
            defaultValue={meetingNotes}
            className={classes.textareaAutosize}
            onChange={event => handleInput(event)}
            onFocus={handleCaret}
          />
          <InputIcon onClick={() => setWriteMode(prev => !prev)} />
        </div>
      }
      {saving &&
        <div className={classes.saving}>
          <CircularProgress />
        </div>
      }
    </div>
  )
}
