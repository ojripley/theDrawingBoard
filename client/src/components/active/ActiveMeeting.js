import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import Canvas from './Canvas';
import useDebounce from '../../hooks/useDebounce';

import { usePeer } from '../../hooks/usePeer';
import { useConnection } from '../../hooks/useConnection';

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

// debugging
var connSender = {};
var connReceiver = {};

export default function ActiveMeeting({ socket, socketOpen, initialNotes, user, meetingId, setInMeeting, ownerId, setMeetingId, setMode, imageLoaded, backgroundImage, initialPixels }) {

  const { peer, setPeer } = usePeer();
  const { connections, setConnections } = useConnection();
  const [newPeer, setNewPeer] = useState(null);
  const [iAmInitiator, setIAmInitiator] = useState(null);
  // const connections = useRef(null);

  useEffect(() => {
    setPeer(new Peer(String(user.id), {key: 'peerjs'}));
    // connections.current = {};
  }, []);

  useEffect(() => {
    console.log('useEffect #2 ran');
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

        // debugging
        connReceiver = conn;
        window.receiver = conn;

        // setting the state needing for opening connections in third useEffect
        setIAmInitiator(false);
        setNewPeer(peerId);
        setConnections(prev => ({
          ...prev,
          [peerId]: conn
        }));

        // connections.current[peerId] = conn;

        // connections.current[peerId].on('open', () => {
        //   connections.current[peerId].on('data', (data) => {
        //     console.log(data);
        //   });
        //   connections.current[peerId].send('test');
        // });

        // connReceiver.on('open', () => {
        //   connReceiver.on('data', (data) => {
        //     console.log(data);
        //   });
        //   connReceiver.send('test');
        // });
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

            // start a call with them
            console.log('i am trying to start a call with', peerId);
            const conn = peer.connect(String(peerId));

            // debugging
            window.initiator = conn;
            connSender = conn;

            // setting the state needing for opening connections in third useEffect
            setIAmInitiator(true);
            setNewPeer(peerId);
            setConnections(prev => ({
              ...prev,
              [peerId]: conn
            }));

            // connections.current[peerId] = conn;

            // connections.current[peerId].on('open', () => {
            //   console.log('connection open');
            //   connections.current[peerId].send('test');
            //   connections.current[peerId].on('data', (data) => {
            //     console.log(data);
            //   });
            // });

            // console.log(conn);
            // connSender.on('open', () => {
            //   console.log('connection open');
            //   connSender.send('test');
            //   connSender.on('data', (data) => {
            //     console.log(data);
            //   });
            // });
          }
        });
      }
    }
    return () => {
      socket.off('newParticipant');
    }

  }, [peer]);

  useEffect(() => {
    console.log('connections changed');

    if (newPeer && peer) {
      console.log('newPeer', newPeer);
      console.log(connections);
      console.log(connections[newPeer]);
      if (iAmInitiator) {
        connections[newPeer].on('open', () => {
          console.log('connection open');
          connections[newPeer].send('test');
          connections[newPeer].on('data', (data) => {
            console.log(data);
          });
        });

      } else {
        connections[newPeer].on('open', () => {
          connections[newPeer].on('data', (data) => {
            console.log(data);
          });
          connections[newPeer].send('test');
        });
      }
    }

  }, [connections]);

  // useEffect(() => {
  //   console.log(connections.current);
  // }, [connections.current]);




















  // useEffect(() => {
  //   if (socketOpen) {
  //     // when someone else joins the meeting
  //     socket.on('newParticipant', (data) => {

  //       // log who that is
  //       console.log('new user', data.user.username);

  //       // make sure it isn't yourself
  //       if (data.user.id !== user.id) {

  //         // start a call with them

  //       }
  //     });
  //   }

  //   return () => {
  //     socket.off('newParticipant');
  //   }
  // }, [socket, socketOpen, peer, connections]);









































































  // useEffect(() => {
  //   console.log('i am', user.id);
  //   if (ownerId !== user.id) {
  //     const peer = new Peer('tc');
  //     console.log('i am going to start a connection');
  //     // setPeers(prev => ({
  //     //   ...prev,
  //     //   peerId: new Peer(ownerId)
  //     // }));






  //     // const connection = peers[ownerId].connect(ownerId);
  //     const connection = peer.connect('oj');

  //     console.log('connection', connection);

  //     connection.on('open', () => {
  //       console.log('connection is opened');

  //       connection.on('data', (data) => {
  //         console.log('incoming', data);
  //       });

  //       connection.send('test');
  //     });






  //     // peer.on('connection', (conn) => {
  //     //   conn.send('test');
  //     //   // listen for data
  //     //   conn.on('data', (data) => {
  //     //     console.log(data);
  //     //   });
  //     // });
  //   }
  // }, []);


  // useEffect(() => {
  //   if (socketOpen) {
  //     // when someone else joins the meeting
  //     socket.on('newParticipant', (data) => {

  //       // log who that is
  //       console.log('new user', data.user.username);

  //       // make sure it's yourself
  //       if (ownerId === user.id && user.id === data.user.id) {
  //         // setConnection(peer.connect(data.user.id));

  //         const peerId = user.id;
  //         // let peer = peers[peerId];
  //         console.log(user.id);

  //         // if user does not yet regard new participant as a peer
  //         // if (!peers[peerId]) {
  //         //   // create a peer
  //         //   // peer = new Peer('oj', { key: 'lwjd5qra8257b9' });
  //         //   setPeers(prev => ({
  //         //     ...prev,
  //         //     peerId: new Peer(peerId)
  //         //   }));
  //         // }

  //         peer.on('open', (id) => {
  //           console.log('connected to peerjs server... my id is');
  //           console.log(id);
  //         })

  //         // // listen for connections
  //         // peer.on('connection', (connection) => {

  //         //   // listen for data
  //         //   connection.on('data', (data) => {
  //         //     console.log(data);
  //         //   });
  //         // });

  //         // const connection = peer.connect(peerId);
  //         // if a connection does not yet exist with this peer
  //         // if (!connections[peerId]) {
  //         //   // make a connection
  //         //   console.log(connection);
  //         //   setConnections(prev => ({
  //         //     ...prev,
  //         //     peerId: connection
  //         //   }));

  //         //   console.log(connections);
  //         // }

  //         // get ready to log whatever data they send when connection is complete
  //         peer.on('connection', (conn) => {
  //           console.log('connected but not open');
  //           conn.on('open', () => {
  //             console.log('open connection', conn);


  //             conn.on('data', (data) => {
  //               console.log(data);
  //             });

  //             conn.send('test');
  //           });
  //         });
  //       }
  //     });
  //   }

  //   return () => {
  //     socket.off('newParticipant');
  //   }
  // }, [socket, socketOpen, peer, connections]);











  // const test = new Peer(user.id);

  // console.log(test);
  // console.log(new Peer(user.id));

  const classes = useStyles();

  // const [imageLoaded, setLoaded] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState(initialNotes || '');
  const [writeMode, setWriteMode] = useState(false);
  const [saving, setSaving] = useState(true);
  const debouncedNotes = useDebounce(meetingNotes, 400);
  // const backgroundCanvas = useRef(null);

  // webrtc state
  // setting connection state always seems to be null...
  // const [peer, setPeer] = useState(new Peer(user.id));
  // const [peer, setPeer] = useState(null);
  // const [connection, setConnection] = useState(null);
  // const [call, setCall] = useState(null);

  const textareaRef = useRef(null);
  // const peer = new Peer(user.id);

  // useEffect doesn't seem to work with peer connection
  // useEffect(() => {

  //   peer.on('connection', (conn) => {
  //     conn.on('data', (data) => {
  //       console.log(data);
  //     })
  //   });

  // }, []);















  // peer.on('connection', (connection) => {
  //   console.log('new connection', connection);
  //   console.log(connection);
  //   // const conn = peer.connect(connection.peer);
  //   connection.on('data', (data) => {
  //     console.log('connection data', data);
  //   });
  // });

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

  // useEffect(() => {
  //   peer.on('connection', (connection) => {
  //     connection.on('data', (data) => {
  //       console.log(data);
  //     })
  //   });

  //   return () => {
  //     peer.off('connection');
  //   }
  // }, [peer]);

  // useEffect(() => {
  //   if (socketOpen) {
  //     // when someone else joins the meeting
  //     socket.on('newParticipant', (data) => {

  //       // log who that is
  //       console.log(data.user.username);

  //       // make sure it's not yourself
  //       if (data.user.id !== user.id) {
  //         // setConnection(peer.connect(data.user.id));

  //         // make a connection with them
  //         const connection = peer.connect(data.user.id);
  //         console.log('connection', connection);

  //         // get ready to log whatever data they send when connection is complete
  //         connection.on('open', () => {
  //           console.log('open connection');
  //           connection.send('test');
  //         });
  //       }
  //     });
  //   }

  //   return () => {
  //     socket.off('newParticipant');
  //   }
  // }, [socket, socketOpen]);

  // useEffect(() => {
  //   // setPeer(new Peer(user.id));
  //   console.log(peer);

  //   setCall(peer)

  // }, [peer]);

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
      // console.log(debouncedNotes);
      console.log('requesting note save');
      socket.emit('saveDebouncedNotes', { user: user, meetingId: meetingId, notes: debouncedNotes });
      // socket.on('receiveOkay') //can have a socket on when received
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
