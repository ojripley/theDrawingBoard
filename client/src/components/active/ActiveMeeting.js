import React, { useState, useEffect, useRef, useReducer } from 'react';
import Canvas from './Canvas';
import useDebounce from '../../hooks/useDebounce';

import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
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
  box: {
    width: '70%',
    borderRadius: '15px 15px',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    padding: '0.5em 0.5em',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textareaAutosize: {
    resize: 'none',
    marginRight: '1em',
    border: 'none',
    width: '100%',
    borderRadius: '15px 15px',
  },
  center: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 50,
    position: 'fixed',
    zIndex: 2,
    bottom: 40,
    width: "100%",
  },
  saving: {
    position: 'absolute',
    right: '14.7%'
  },
}));

export default function ActiveMeeting({ socket, socketOpen, initialNotes, user, meetingId, setInMeeting, ownerId, setMeetingId, setMode, imageLoaded, setImageLoaded, backgroundImage, setBackgroundImage, initialPixels, setLoading, pixelColor }) {

  const classes = useStyles();

  // const [imageLoaded, setLoaded] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState(initialNotes || '');
  const [writeMode, setWriteMode] = useState(true);
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
  // const [dataURL,setDataURL] = useState([]); //stores files to be sent
  // let dataURL = Array(backgroundImage.length);
  // const backgroundCanvas = useRef(null);


  const textareaRef = useRef(null);

  console.log('at 0', initialPixels[0])


  const handleInput = (e) => {
    console.log(e.target.value)
    setMeetingNotes(e.target.value);
    setSaving(true);
  }

  const handleCaret = e => {
    const temp_value = e.target.value
    e.target.value = ''
    e.target.value = temp_value
  }

  const handleEscape = e => {
    if (e.keyCode === 27) {
      setWriteMode(false);
    }
  }

  // const mergeWithImage = (imageCanvas) => {

  //   prev.drawImage(backgroundImage, 0, 0, imageCanvasRef.current.width, imageCanvasRef.current.height);
  //   prev.drawImage(drawCanvasRef.current, 0, 0, backgroundImage.width, backgroundImage.height);
  //   // setImageCtx(prev => { //adds the click to the image canvas
  //   // prev = imageCanvasRef.current.getContext('2d')
  //   // imageCanvasRef.current.width = backgroundImage.width;
  //   // imageCanvasRef.current.height = backgroundImage.height;
  //   prev.drawImage(backgroundImage, 0, 0, imageCanvasRef.current.width, imageCanvasRef.current.height);
  //   prev.drawImage(drawCanvasRef.current, 0, 0, backgroundImage.width, backgroundImage.height);
  //   // });
  // }

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
            tool={tool}
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
              <div className={classes.box}>
                <TextareaAutosize
                  ref={textareaRef}
                  aria-label='personal notes'
                  placeholder='Press ESC to hide'
                  defaultValue={meetingNotes}
                  className={classes.textareaAutosize}
                  onChange={event => handleInput(event)}
                  onKeyUp={handleEscape}
                  onFocus={handleCaret}
                  rows='2'
                  rowsMax='4'
                />
                <CloseIcon className={classes.close} onClick={() => setWriteMode(false)}/>
                {saving && <CircularProgress className={classes.saving} color='secondary' size='30px' />}
              </div>
            </div>
          }
          {/* <canvas id="mergingCanvas"></canvas> */}
          <canvas id="sendingCanvas" ref={finalCanvasRef}></canvas>
        </div>
      }
    </>
  )
}
