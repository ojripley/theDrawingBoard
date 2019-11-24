import React, { useState, useEffect, useRef, useReducer } from 'react';
import './Canvas.scss';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import Fab from '@material-ui/core/Fab';


// const SET_X = "SET_X";
// const SET_Y = "SET_Y";
// const SET_DRAG = "SET_DRAG";
const SET_INITIAL_PIXELS = "SET_INITIAL_PIXELS";
const SET_PIXEL = "SET_PIXEL";
const SET_CTX = "SET_CTX";
const REDRAW = "REDRAW";

function reducer(state, action) {
  switch (action.type) {
    case SET_INITIAL_PIXELS: {
      return {
        ...state,
        pixelArrays: action.payload
      }
    }
    case SET_PIXEL: {
      if (state.pixelArrays[action.payload.user]) {
        return {
          ...state,
          pixelArrays: {
            ...state.pixelArrays,
            [action.payload.user]: [...state.pixelArrays[action.payload.user], action.payload.pixel]
          }
        }
      } else {
        return {
          ...state,
          pixelArrays: {
            ...state.pixelArrays,
            [action.payload.user]: [action.payload.pixel]
          }
        }
      }
    }
    case SET_CTX:
      return { ...state, ctx: action.payload };
    case REDRAW: {
      state.ctx.clearRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height); // Clears the drawCanvas
      //Sets the properties (change this part for custom pixel colors)
      state.ctx.lineJoin = "round";
      state.ctx.lineWidth = 2;
      state.ctx.strokeStyle = '#00000';

      for (let user in state.pixelArrays) {

        let pixels = state.pixelArrays[user]
        for (let i in pixels) {

          state.ctx.beginPath(); //start drawing a single line
          if (pixels[i].dragging && i) { //if we're in dragging mode, use the last pixel
            state.ctx.moveTo(pixels[i - 1].x, pixels[i - 1].y);
          } else { //else use the current pixel, offset by 1px to the left
            state.ctx.moveTo(pixels[i].x - 1, pixels[i].y);
          }
          state.ctx.lineTo(pixels[i].x, pixels[i].y);//draw a line from point mentioned above to the current pixel
          state.ctx.closePath();//end the line
          state.ctx.stroke();//draw the line
        }
      }
      /* Old way (single array) Remove once we confirm multiuser array method works
       for (let i = 0; i < state.clickX.length; i++) {
          state.ctx.beginPath();
          if (state.clickDrag[i] && i) {
            state.ctx.moveTo(state.clickX[i - 1], state.clickY[i - 1]);
          } else {
            state.ctx.moveTo(state.clickX[i] - 1, state.clickY[i]);
          }
          state.ctx.lineTo(state.clickX[i], state.clickY[i]);
          state.ctx.closePath();
          state.ctx.stroke();
        }
      */

      return { ...state };
    }
    default:
      throw new Error();
  }
}

export default function Canvas({ imageEl, isLoaded, socket, socketOpen, user, meetingId, initialPixels }) {

  const useStyles = makeStyles(theme => ({
    endFab: {
      margin: theme.spacing(1),
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 3
    }
  }));

  const classes = useStyles();

  //State for drawing canvas:
  const drawCanvasRef = useRef(null);
  let [paint, setPaint] = useState(false);
  const myCode = useRef(Math.floor(Math.random() * 1000), [])

  const [drawingState, dispatch] = useReducer(reducer, {
    pixelArrays: { ...initialPixels },
    ctx: undefined
  });


  //State for image canvas:
  const imageCanvasRef = useRef(null);
  let [imageCtx, setImageCtx] = useState();


  //Loads the initial drawing canvas
  useEffect(() => {
    drawCanvasRef.current.width = window.innerWidth;
    drawCanvasRef.current.height = imageEl.height * window.innerWidth / imageEl.width;
    const newCtx = drawCanvasRef.current.getContext('2d');
    dispatch({
      type: SET_CTX,
      payload: newCtx
    });
  }, [isLoaded, imageEl]);



  const mergeWithImage = () => {
    console.log('imageEl on merge:', imageEl.height, imageEl.width);
    setImageCtx(prev => { //adds the click to the image canvas
      prev = imageCanvasRef.current.getContext('2d')
      prev.drawImage(drawCanvasRef.current, 0, 0, imageEl.width, imageEl.height);
    });
  }

  useEffect(() => {
    if (socketOpen) {
      socket.on('drawClick', data => {
        if (myCode.current !== data.code) {
          dispatch({ type: SET_PIXEL, payload: { user: data.user, pixel: data.pixel } });
          dispatch({ type: REDRAW });
        }
      });
      return () => {
        socket.off('drawClick');
      };
    }
  }, [socket, socketOpen, user.username]);

  const endMeeting = () => {
    console.log('meeting ended');
    mergeWithImage();
    let dataURL = imageCanvasRef.current.toDataURL();

    socket.emit('endMeeting', {
      meetingId: meetingId,
      endTime: new Date(Date.now()),
      image: dataURL
    });
  }

  //Sets the image canvas after it has loaded (and upon any changes in image)
  useEffect(() => {
    console.log('imageEl on load:', imageEl.height, imageEl.width);

    setImageCtx(prev => {
      imageCanvasRef.current.width = window.innerWidth;
      imageCanvasRef.current.height = imageEl.height * window.innerWidth / imageEl.width;
      prev = imageCanvasRef.current.getContext('2d');
      prev.drawImage(imageEl, 0, 0, imageCanvasRef.current.width, imageCanvasRef.current.height);
      dispatch({ type: SET_INITIAL_PIXELS, payload: initialPixels })
      dispatch({ type: REDRAW })
    });
  }, [imageCtx, isLoaded, imageEl, initialPixels]);


  const addClick = (x, y, dragging) => {
    //Uncomment this if you want the user to
    let pixel = {
      x: x,
      y: y,
      dragging: dragging
    };
    dispatch({ type: SET_PIXEL, payload: { user: myCode.current, pixel: pixel } });
    dispatch({ type: REDRAW });
    // mergeWithImage();
  };


  const handleMouseDown = e => {
    let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
    let mouseY = e.pageY - drawCanvasRef.current.offsetTop;
    setPaint(true);
    addClick(mouseX, mouseY);
    socket.emit('addClick', { user: user, pixel: { x: mouseX, y: mouseY, dragging: false }, meetingId: meetingId, code: myCode.current });
  }

  const handleMouseMove = e => { //Change to useCallback??
    if (paint) {
      let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
      let mouseY = e.pageY - drawCanvasRef.current.offsetTop
      addClick(mouseX, mouseY, true);
      socket.emit('addClick', { user: user, pixel: { x: mouseX, y: mouseY, dragging: true }, meetingId: meetingId, code: myCode.current });
    }
  }

  return (
    <>
      <Fab
        aria-label='end'
        color='primary'
        className={classes.endFab}
        onClick={endMeeting} >
        <CloseIcon />
      </Fab>
      <div id='canvas-container'>



        <canvas
          id='image'
          ref={imageCanvasRef}
        >
        </canvas>
        <canvas
          id='drawCanvas'
          ref={drawCanvasRef}
          onMouseDown={e => handleMouseDown(e.nativeEvent)}
          onMouseMove={e => handleMouseMove(e.nativeEvent)}
          onMouseUp={e => setPaint(false)}
          onMouseLeave={e => setPaint(false)}
          onTouchStart={e => handleMouseDown(e.nativeEvent.touches[0])}
          onTouchMove={e => handleMouseMove(e.nativeEvent.touches[0])}
          onTouchEnd={e => setPaint(false)}
        >
        </canvas>
      </div>
    </>
  );
}
