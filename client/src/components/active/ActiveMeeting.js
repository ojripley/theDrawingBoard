import React, { useState, useEffect, useRef } from 'react';
import Canvas from './Canvas';
import useDebounce from '../../hooks/useDebounce';

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

export default function ActiveMeeting({ socket, socketOpen, initialNotes, user, meetingId, setInMeeting, ownerId, setMeetingId, setMode, imageLoaded, backgroundImage, initialPixels, pixelColor }) {
  // const [imageLoaded, setLoaded] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState(initialNotes || '');
  const [writeMode, setWriteMode] = useState(false);
  const [saving, setSaving] = useState(true);
  const debouncedNotes = useDebounce(meetingNotes, 400);
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [highlighting, setHighlighting] = useState(false);

  // const backgroundCanvas = useRef(null);

  const textareaRef = useRef(null);

  const classes = useStyles();

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
    // console.log(debouncedNotes);
    console.log('requesting note save');
    socket.emit('saveDebouncedNotes', { user: user, meetingId: meetingId, notes: debouncedNotes });
    // socket.on('receiveOkay') //can have a socket on when received
    setSaving(false);
  }, [socket, debouncedNotes, user, meetingId])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [writeMode])

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
        setStrokeWidth={setStrokeWidth}
        setHighlighting={setHighlighting}
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
        pixelColor={pixelColor}
        strokeWidth={strokeWidth}
        highlighting={highlighting}
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
