import React, { useState, useEffect, useRef, useReducer } from 'react';
import Canvas from './Canvas';
import useDebounce from '../../hooks/useDebounce';

import { makeStyles } from '@material-ui/core/styles';
import InputIcon from '@material-ui/icons/Input';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import CircularProgress from '@material-ui/core/CircularProgress';

import CanvasDrawer from './CanvasDrawer';

import reducer, {
  ADD_USER,
  SET_INITIAL_PIXELS,
  SET_PIXEL,
  SET_CTX,
  REDRAW,
  SET_POINTER
} from "../../reducers/canvasReducer";


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

export default function ActiveMeeting({ socket, socketOpen, initialNotes, user, meetingId, setInMeeting, ownerId, setMeetingId, setMode, imageLoaded, setImageLoaded, backgroundImage, setBackgroundImage, initialPixels, loading, setLoading, pixelColor }) {
  //TODO: Add state for page

  const classes = useStyles();

  // const [imageLoaded, setLoaded] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState(initialNotes || '');
  const [writeMode, setWriteMode] = useState(false);

  const [saving, setSaving] = useState(true);
  const debouncedNotes = useDebounce(meetingNotes, 400);
  const [tool, setTool] = useState("pen");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [highlighting, setHighlighting] = useState(false);
  const [pointing, setPointing] = useState(false);

  const [page, setPage] = useState(0);

  const [canvasState, dispatch] = useReducer(reducer, {
    pixelArrays: { ...initialPixels },
    ctx: undefined,
    color: pixelColor,
    pointers: {} //if needed make take the initial state from server
  });

  // const backgroundCanvas = useRef(null);


  const textareaRef = useRef(null);

  console.log('at 0', initialPixels[0])


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

    socket.on('loadTheSpinnerPls', () => {
      setLoading(true);
    });

    socket.on('requestNotes', res => {
      setLoading(true);
      socket.emit('notes', { user: user, meetingId: meetingId, notes: meetingNotes });
    });

    socket.on('concludedMeetingId', res => {
      setInMeeting(false);
      setMeetingId(null);
      setBackgroundImage(new Image());
      setLoading(false);
    });


    socket.on('changingPage', data => {
      console.log('trying to change page');
      if (data.user.id !== user.id) { //Don't need to change the owner too
        console.log(`Changing page to ${data.page}`, data.page)
        setPage(data.page);
      }
    });

    return () => {
      socket.off('requestNotes');
      socket.off('concludedMeetingId');
      socket.off('changingPage');
    };
  }, [socket, setInMeeting, debouncedNotes, meetingId, meetingNotes, setMeetingId, user, setBackgroundImage, setLoading, setPage])

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
    imageLoaded && <div className={classes.root}>
      <CanvasDrawer //TODO: pass in setPage
        user={user}
        ownerId={ownerId}
        socket={socket}
        socketOpen={socketOpen}
        meetingId={meetingId}
        setMode={setMode}
        setImageLoaded={setImageLoaded}
        setInMeeting={setInMeeting}
        setWriteMode={setWriteMode}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        setHighlighting={setHighlighting}
        setPointing={setPointing}
        setTool={setTool}
        page={page}
        totalPages={backgroundImage.length}
        setPage={setPage}
      />
      <Canvas
        user={user}
        ownerId={ownerId}
        socket={socket}
        socketOpen={socketOpen}
        backgroundImage={backgroundImage[page]}//TODO: change to index (backgroundImage[page])
        // setBackgroundImage={setBackgroundImage}//TODO: change to index (backgroundImage[page])
        imageLoaded={imageLoaded}
        meetingId={meetingId}
        // initialPixels={initialPixels[page]}//TODO: change to index (backgroundImage[page])
        setLoading={setLoading}
        pixelColor={pixelColor}
        strokeWidth={strokeWidth}
        highlighting={highlighting}
        pointing={pointing}
        tool={tool}
        page={page}
        canvasState={canvasState}
        dispatch={dispatch}
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
          <CircularProgress color='secondary' />
        </div>
      }
    </div>
  )
}
