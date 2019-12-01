import React, { useState, useEffect, useRef, useReducer } from 'react';
import Canvas from './Canvas';
import useDebounce from '../../hooks/useDebounce';

import { makeStyles } from '@material-ui/core/styles';
import InputIcon from '@material-ui/icons/Input';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import CircularProgress from '@material-ui/core/CircularProgress';

import CanvasDrawer from './CanvasDrawer';

import reducer, {
  SAVE
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

export default function ActiveMeeting({ socket,
  socketOpen,
  initialNotes,
  user,
  meetingId,
  setInMeeting,
  ownerId,
  setMeetingId,
  setMode,
  imageLoaded,
  setImageLoaded,
  backgroundImage,
  setBackgroundImage,
  initialPixels,
  setLoading,
  pixelColor,
  usersInMeeting
}) {


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
  const finalCanvasRef = useRef(null);

  const [canvasState, dispatch] = useReducer(reducer, {
    pixelArrays: { ...initialPixels },
    ctx: {},
    color: pixelColor,
    pointers: {}, //if needed make take the initial state from server
    finishedSaving: Array(backgroundImage.length)
  });

  const textareaRef = useRef(null);

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

  const endMeeting = () => {
    //TODO: handle case with no image
    // mergeWithImage();
    // let sendingCanvas = (<canvas></canvas>);
    for (let i in backgroundImage) {
      console.log("working on", i);
      let bkgdImg = backgroundImage[i];
      finalCanvasRef.current.width = bkgdImg.width;
      finalCanvasRef.current.height = bkgdImg.height;
      let sendingCtx = finalCanvasRef.current.getContext('2d');
      canvasState.ctx.drawImage(bkgdImg, 0, 0, bkgdImg.width, bkgdImg.height);
      dispatch({ type: SAVE, payload: { page: i, ctx: sendingCtx, backgroundImage: bkgdImg } });
    }

  }

  useEffect(() => {
    //Checks if all the saved images are done loading. FinishedSaving is an array of length equal to the length of the background images, intially with undefined values
    //As images are prepped for saving, the entry is replaced with the data (base64) for the img. The below reduce counts the number of elements that are not undefined, and once that reaches the number of images an emit is made to the server with the data as an array
    if (canvasState.finishedSaving.reduce((p, c) => p + (c ? 1 : 0), 0) === backgroundImage.length) {

      socket.emit('endMeeting', {
        meetingId: meetingId,
        endTime: new Date(Date.now()),
        image: canvasState.finishedSaving
      })
    }

  }, [canvasState.finishedSaving, meetingId, socket, backgroundImage, canvasState.ctx.canvas])

  const loadSpinner = () => {
    socket.emit('savingMeeting', { meetingId: meetingId });
    setLoading(true);
    endMeeting();
  };

  useEffect(() => {

    socket.on('loadTheSpinnerPls', () => {
      setLoading(true);
    });

    socket.on('requestNotes', res => {
      setLoading(true);
      socket.emit('notes', { user: user, meetingId: meetingId, notes: meetingNotes, meetingName: res.meetingName });
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
      socket.off('loadTheSpinnerPls');
      socket.off('requestNotes');
      socket.off('concludedMeetingId');
      socket.off('changingPage');
    };
  }, [socket, setInMeeting, debouncedNotes, meetingId, meetingNotes, setMeetingId, user, setBackgroundImage, setLoading, setPage])

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
  }, [writeMode]);


  const liveUsers = Object.keys(usersInMeeting).map((key) => {
    const liveUser = usersInMeeting[key];
    // return (
    //   <LiveUsers
    //     key={liveUser.id}
    //     id={liveUser.id}
    //     username={liveUser.id}
    //   ></LiveUsers>
    // )
  });


  return (
    <>
      {imageLoaded &&
        <div className={classes.root}>
          <CanvasDrawer
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
            loadSpinner={loadSpinner}
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
          {/* <canvas id="mergingCanvas"></canvas> */}
          {saving &&
            <div className={classes.saving}>
              <CircularProgress color='secondary' />
            </div>
          }
          <canvas id="sendingCanvas" ref={finalCanvasRef}></canvas>
        </div>
      }
    </>
  )
}
