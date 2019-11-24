import React, { useState, useEffect, useRef } from 'react';
import theImage from './tmp.jpg';
import Canvas from './Canvas';
import useDebounce from '../../hooks/useDebounce';

import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import CircularProgress from '@material-ui/core/CircularProgress';


const useStyles = makeStyles(theme => ({
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
    position: 'absolute',
    zIndex: 2,
    bottom: 20,
    width: "50%"
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    height: 100,
    width: "100%"
  },
  root: {
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

export default function ActiveMeeting({ socket, socketOpen, initialNotes, user, meetingId, setInMeeting, ownerId, setMeetingId, setMode, imageLoaded, backgroundImage, initialPixels}) {
  // const [imageLoaded, setLoaded] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [writeMode, setWriteMode] = useState(false);
  const [saving, setSaving] = useState(true);
  const debouncedNotes = useDebounce(meetingNotes, 400);
  // const backgroundCanvas = useRef(null);


  const classes = useStyles();

  const handleInput = (e) => {
    console.log(e.target.value)
    setMeetingNotes(e.target.value);
    setSaving(true);
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
    // console.log(debouncedNotes);
    socket.emit('saveNotes', { user, note: debouncedNotes });
    // socket.on('receiveOkay') //can have a socket on when received
    setSaving(false);
  }, [socket, debouncedNotes, user])


  // let myImage = new Image();
  // myImage.onload = () => { setLoaded(true) };
  // myImage.src = theImage; //pull this from socket
  return (
    imageLoaded && <>
      <Canvas
        user={user}
        socket={socket}
        socketOpen={socketOpen}
        imageEl={backgroundImage}
        isLoaded={imageLoaded}
        meetingId={meetingId}
        initialPixels={initialPixels}
      />
      <Fab
        aria-label='edit'
        color='secondary'
        className={classes.fab}
        onClick={() => setWriteMode(prev => !prev)} >
        <EditIcon />
      </Fab>
      {writeMode &&
        <div className={classes.center}>
          <TextareaAutosize
            aria-label='empty textarea'
            placeholder='Empty'
            defaultValue={meetingNotes}
            className={classes.textareaAutosize}
            onChange={event => handleInput(event)}
          />
        </div>
      }
      {saving &&
        <div className={classes.root}>
          <CircularProgress />
        </div>
      }
    </>
  )

}
