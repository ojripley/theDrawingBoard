import React, { useState, useEffect, useRef, useReducer } from 'react';
import Canvas from './Canvas';
import useDebounce from '../../hooks/useDebounce';

import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import CircularProgress from '@material-ui/core/CircularProgress';

import CanvasDrawer from './CanvasDrawer';
import './ActiveMeeting.scss';

import './ActiveMeeting.scss';

import reducer, {
  SAVE
} from "../../reducers/canvasReducer";

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    // flexDirection: 'row',
    // justifyContent: 'center'
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
    justifyContent: 'space-between',
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
    left: 0,
    width: "100%",
  },
  saving: {
    position: 'absolute',
    right: '14.7%'
  },
}));

export default function ActiveMeeting({ socket,
  socketOpen,
  initialNotes,
  user,
  meetingId,
  setInMeeting,
  inMeeting,
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
  usersInMeeting,
  setUsersInMeeting
}) {


  const classes = useStyles();

  const [userChips, setUserChips] = useState(null);

  const [meetingNotes, setMeetingNotes] = useState(initialNotes || '');
  const [writeMode, setWriteMode] = useState(false);
  const [saving, setSaving] = useState(true);
  const debouncedNotes = useDebounce(meetingNotes, 400);

  const [tool, setTool] = useState("pen");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [highlighting, setHighlighting] = useState(false);
  const [pointing, setPointing] = useState(false);
  const [hideButtons, setHideButtons] = useState(false);

  const [page, setPage] = useState(0);
  const canviiRef = useRef([]);

  const [canvasState, dispatch] = useReducer(reducer, {
    pixelArrays: { ...initialPixels },
    ctx: {},
    color: pixelColor,
    pointers: {},
    finishedSaving: Array(backgroundImage.length)
  });

  const textareaRef = useRef(null);

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

  useEffect(() => { //Stores references to the canvases that are defined below
    if (imageLoaded && backgroundImage) {
      canviiRef.current = canviiRef.current.slice(0, backgroundImage.length)
    }
  }, [imageLoaded, backgroundImage, backgroundImage.length]);

  const canvii = backgroundImage.map((image, index) => {
    return <canvas key={index} className="sendingCanvas" ref={el => canviiRef.current[index] = el}></canvas>
  });
  const endMeeting = () => {
    for (let i in backgroundImage) {
      console.log("working on", i);
      let bkgdImg = backgroundImage[i];
      canviiRef.current[i].width = bkgdImg.width;
      canviiRef.current[i].height = bkgdImg.height;
      let sendingCtx = canviiRef.current[i].getContext('2d');

      canvasState.ctx.drawImage(bkgdImg, 0, 0, bkgdImg.width, bkgdImg.height);
      dispatch({ type: SAVE, payload: { page: i, ctx: sendingCtx, backgroundImage: bkgdImg } });
    }

  }

  useEffect(() => {

    let countSaved = canvasState.finishedSaving.reduce((accumulator, current) => {
      if (current) {
        return accumulator + 1;
      } else {
        return accumulator;
      }
    }, 0);

    if (countSaved === backgroundImage.length) {

      socket.emit('endMeeting', {
        meetingId: meetingId,
        endTime: new Date(Date.now()),
        image: canvasState.finishedSaving
      })
    }
  }, [canvasState.finishedSaving, meetingId, socket, backgroundImage, canvasState.ctx.canvas])

  const loadSpinner = () => {
    setUsersInMeeting(null);
    socket.emit('savingMeeting', { meetingId: meetingId });
    setLoading(true);
    endMeeting();
  };

  useEffect(() => {

    socket.on('loadTheSpinnerPls', () => {
      setLoading(true);
    });

    socket.on('requestNotes', res => {
      setUsersInMeeting(null);
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



  useEffect(() => {

    if (usersInMeeting) {
      const tempUserChips = Object.keys(usersInMeeting).map((key) => {
        if (usersInMeeting[key]) {
          const liveUser = usersInMeeting[key];
          let colourId = null;

          if (canvasState.color[liveUser.id]) {

            const colour = canvasState.color[liveUser.id];

            console.log(colour);

            if (colour.r === 0 && colour.g === 0 && colour.b === 255) {
              colourId = 'one';
            }

            if (colour.r === 255 && colour.g === 0 && colour.b === 0) {
              colourId = 'two';
            }

            if (colour.r === 0 && colour.g === 255 && colour.b === 0) {
              colourId = 'three';
            }

            if (colour.r === 255 && colour.g === 0 && colour.b === 155) {
              colourId = 'four';
            }
          }

          return (
            <p key={liveUser.id} id={colourId} className='user-chip'>
              {liveUser.username}
            </p>
          )
        } else {
          return null;
        }
      });
      setUserChips(tempUserChips);
    }


  }, [usersInMeeting]);


  return (
    <>
      {imageLoaded &&
        <div className={classes.root}>
          <div className='user-chips'>{userChips}</div>
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
            setUsersInMeeting={setUsersInMeeting}
          />
          <Canvas
            user={user}
            ownerId={ownerId}
            socket={socket}
            socketOpen={socketOpen}
            backgroundImage={backgroundImage[page]}
            imageLoaded={imageLoaded}
            meetingId={meetingId}
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
                <CloseIcon className={classes.close} onClick={() => setWriteMode(false)} />
                {saving && <CircularProgress className={classes.saving} color='secondary' size='30px' />}
              </div>
            </div>
          }
          {canvii}
        </div>
      }
    </>
  )
}
