import React, { useState, useEffect, useRef, useReducer } from 'react';
import './Canvas.scss';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const ADD_USER = "ADD_USER";
const SET_INITIAL_PIXELS = "SET_INITIAL_PIXELS";
const SET_PIXEL = "SET_PIXEL";
const SET_CTX = "SET_CTX";
const REDRAW = "REDRAW";
const SET_POINTER = "SET_POINTER";

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
    case SET_POINTER:
      return {
        ...state,
        pointing: {
          ...state.pointing,
          [action.payload.user]: action.payload.pixel
        }
      };
    case REDRAW: {
      state.ctx.clearRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height); // Clears the drawCanvas
      const w = state.ctx.canvas.width;
      const h = state.ctx.canvas.height;

      // state.ctx.strokeStyle = state.color;
      console.log(state);
      for (let user in state.pixelArrays) {
        let pixels = state.pixelArrays[user]; //gets users pixel array
        //Reads colors
        let col = `rgb(${state.color[user].r},${state.color[user].g},${state.color[user].b},1)`
        let highlightCol = `rgb(${state.color[user].r},${state.color[user].g},${state.color[user].b},0.1)`
        state.ctx.lineJoin = "round";

        for (let i in pixels) {
          state.ctx.beginPath(); //start drawing a single line
          if (pixels[i].tool === "highlighter") {
            // console.log("lighting")
            // state.ctx.globalAlpha = 0.2;
            state.ctx.lineCap = 'butt';
            state.ctx.strokeStyle = highlightCol;
          } else {
            // console.log("not lighting")
            state.ctx.lineCap = 'round';
            state.ctx.strokeStyle = col;
          }
          state.ctx.lineWidth = pixels[i].strokeWidth || 1;
          // pixels[i].highlighting ? console.log("HIIII") : console.log("LOOOO");
          // console.log(state.color[user])
          if (pixels[i].dragging && i) { //if we're in dragging mode, use the last pixel
            state.ctx.moveTo(pixels[i - 1].x * w, pixels[i - 1].y * h);
          } else { //else use the current pixel, offset by 1px to the left
            state.ctx.moveTo(pixels[i].x * w, pixels[i].y * h - 1);
          }
          state.ctx.lineTo(pixels[i].x * w, pixels[i].y * h);//draw a line from point mentioned above to the current pixel
          // state.ctx.save();
          // state.ctx.fillRect(pixels[i].x * w, pixels[i].y * h, 10, 10); // fill in the pixel at (10,10)

          state.ctx.stroke();//draw the line
          state.ctx.closePath();//end the line
        }
        if (state.pointing[user] && state.pointing[user].x) {
          state.ctx.beginPath();
          // state.ctx.arc(state.pointing[user].x * w, state.pointing[user].y * h, 20, 0, 2 * Math.PI);//center, r, stangle, endangle
          let x = state.pointing[user].x * w;
          let y = state.pointing[user].y * h;

          let gradient = state.ctx.createRadialGradient(x, y, 1, x, y, 10);
          gradient.addColorStop(0, col);
          gradient.addColorStop(1, 'white');

          state.ctx.arc(x, y, 8, 0, 2 * Math.PI);
          state.ctx.fillStyle = gradient;
          state.ctx.fill();
        }

      }

      return { ...state };
    }
    case ADD_USER: {
      return {
        ...state,
        color: {
          ...state.color,
          [action.payload.user]: action.payload.color
        }
      };
    }
    default:
      throw new Error();
  }
}

export default function Canvas({ backgroundImage, imageLoaded, socket, socketOpen, user, meetingId, initialPixels, ownerId, setLoading, pixelColor, strokeWidth, tool }) {
  const TRIGGER_ZONE = 15;

  const useStyles = makeStyles(theme => ({
    endMeeting: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      zIndex: 10
    }
  }));
  const classes = useStyles();

  //State for drawing canvas:
  const drawCanvasRef = useRef({});
  let [paint, setPaint] = useState(false);
  // const myCode = useRef(Math.floor(Math.random() * 1000), [])

  const [canvasState, dispatch] = useReducer(reducer, {
    pixelArrays: { ...initialPixels },
    ctx: undefined,
    color: pixelColor,
    pointing: {} //if needed make take the initial state from server
  });

  //State for image canvas:
  const imageCanvasRef = useRef(null);
  let [imageCtx, setImageCtx] = useState();

  //Loads the initial drawing canvas
  useEffect(() => {
    window.onresize = () => {
      drawCanvasRef.current.width = window.innerWidth;
      drawCanvasRef.current.height = backgroundImage.height === 0 ? window.innerHeight : (backgroundImage.height * window.innerWidth / backgroundImage.width);
      dispatch({ type: REDRAW });
    }

    drawCanvasRef.current.width = window.innerWidth;
    drawCanvasRef.current.height = backgroundImage.height === 0 ? window.innerHeight : (backgroundImage.height * window.innerWidth / backgroundImage.width);
    const newCtx = drawCanvasRef.current.getContext('2d');
    dispatch({
      type: SET_CTX,
      payload: newCtx
    });
    dispatch({ type: REDRAW });

    return () => {
      window.onresize = undefined;
    }


  }, [imageLoaded, backgroundImage]);

  const mapToRelativeUnits = (pixel) => {
    let w = drawCanvasRef.current.width;
    let h = drawCanvasRef.current.height;
    pixel.x = pixel.x / w;
    pixel.y = pixel.y / h;
    return pixel;
  }

  const mergeWithImage = () => {
    setImageCtx(prev => { //adds the click to the image canvas
      prev = imageCanvasRef.current.getContext('2d')
      imageCanvasRef.current.width = backgroundImage.width;
      imageCanvasRef.current.height = backgroundImage.height;
      prev.drawImage(backgroundImage, 0, 0, imageCanvasRef.current.width, imageCanvasRef.current.height);
      prev.drawImage(drawCanvasRef.current, 0, 0, backgroundImage.width, backgroundImage.height);
    });
  }

  useEffect(() => {
    if (socketOpen) {
      socket.on('drawClick', data => {
        if (user.id !== data.user.id) {
          console.log("Other person is drawing", data.user.id);

          dispatch({ type: SET_PIXEL, payload: { user: data.user.id, pixel: data.pixel } });
          dispatch({ type: REDRAW });
        }
      });
      return () => {
        socket.off('drawClick');
      };
    }
  }, [socket, socketOpen, user.id]);

  useEffect(() => {
    if (socketOpen) {
      socket.on('redraw', (data) => {
        console.log('redrawing pixels!');
        dispatch({ type: SET_INITIAL_PIXELS, payload: data.pixels });
        dispatch({ type: REDRAW });
      });

      socket.on('newParticipant', data => {
        console.log('New user joined jlkjlkjlkjlkjlk', data);
        console.log(data.color);
        dispatch({ type: ADD_USER, payload: { user: data.user.id, color: data.color } });
      });


      return () => {
        socket.off('drawClick');
      };
    }
  }, [socket, socketOpen, user.id]);

  const loadSpinner = () => {
    socket.emit('savingMeeting', { meetingId: meetingId });
    setLoading(true);
    endMeeting();
  };

  const endMeeting = () => {
    console.log('meeting ended');
    mergeWithImage();
    let dataURL = "";
    if (backgroundImage.width === 0) {
      dataURL = drawCanvasRef.current.toDataURL();
    } else {
      dataURL = imageCanvasRef.current.toDataURL();
    }
    socket.emit('endMeeting', {
      meetingId: meetingId,
      endTime: new Date(Date.now()),
      image: dataURL
    });

  }

  //Sets the image canvas after it has loaded (and upon any changes in image)
  useEffect(() => {
    setImageCtx(prev => {

      imageCanvasRef.current.width = window.innerWidth;
      imageCanvasRef.current.height = backgroundImage.height === 0 ? window.innerHeight : (backgroundImage.height * window.innerWidth / backgroundImage.width);
      prev = imageCanvasRef.current.getContext('2d');
      prev.drawImage(backgroundImage, 0, 0, imageCanvasRef.current.width, imageCanvasRef.current.height);
      dispatch({ type: SET_INITIAL_PIXELS, payload: initialPixels })
      dispatch({ type: REDRAW })
    });
  }, [imageCtx, imageLoaded, backgroundImage, initialPixels]);

  const addClick = (x, y, dragging) => {
    if (tool === "pointer") {
      let pixel =
      {
        x: x,
        y: y,
        strokeWidth: strokeWidth //may not use
      };
      let prevPix = canvasState.pointing[user.id];
      let w = drawCanvasRef.current.width;
      let h = drawCanvasRef.current.height;

      if (!prevPix ||
        (x - prevPix.x * w) ** 2 + (y - prevPix.y * h) ** 2 > TRIGGER_ZONE ** 2) {
        dispatch({ type: SET_POINTER, payload: { user: user.id, pixel: mapToRelativeUnits(pixel) } });
        dispatch({ type: REDRAW });
      }
    } else {
      let pixel = {
        x: x,
        y: y,
        dragging: dragging,
        strokeWidth: strokeWidth,
        tool: tool
      };
      mapToRelativeUnits(pixel);
      dispatch({ type: SET_PIXEL, payload: { user: user.id, pixel: pixel } });
      dispatch({ type: REDRAW });
      socket.emit('addClick', { user: user, pixel: pixel, meetingId: meetingId, code: user.id });
    }
  };

  const handleMouseDown = e => {
    let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
    let mouseY = e.pageY - drawCanvasRef.current.offsetTop;
    addClick(mouseX, mouseY);
    setPaint(true);
  }

  const handleMouseMove = e => { //Change to useCallback??
    if (paint) {
      let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
      let mouseY = e.pageY - drawCanvasRef.current.offsetTop;
      addClick(mouseX, mouseY, true);
    }
  }

  const handleMouseUp = e => {
    setPaint(false);
    //Clear the pointer pixel:
    dispatch({ type: SET_POINTER, payload: { user: user.id, pixel: undefined } });
    dispatch({ type: REDRAW });
  }

  return (
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
        onMouseUp={e => handleMouseUp(e.nativeEvent)}
        onMouseLeave={e => handleMouseUp}
        onTouchStart={e => handleMouseDown(e.nativeEvent.touches[0])}
        onTouchMove={e => handleMouseMove(e.nativeEvent.touches[0])}
        onTouchEnd={e => handleMouseUp(e.nativeEvent.touches[0])}
      >
      </canvas>
      {user.id === ownerId && <Button
        variant='contained'
        color='secondary'
        className={classes.endMeeting}
        onClick={loadSpinner}
      >
        End Meeting
        </Button>}
    </div>
  )
}
