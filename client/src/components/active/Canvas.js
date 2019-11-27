import React, { useState, useEffect, useRef, useReducer } from 'react';
import './Canvas.scss';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Loading from '../Loading';

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
      const w = state.ctx.canvas.width;
      const h = state.ctx.canvas.height;
      //Sets the properties (change this part for custom pixel colors)
      state.ctx.lineJoin = "round";
      state.ctx.lineWidth = 2;
      state.ctx.strokeStyle = '#00000';

      for (let user in state.pixelArrays) {

        let pixels = state.pixelArrays[user]
        for (let i in pixels) {
          state.ctx.beginPath(); //start drawing a single line
          if (pixels[i].dragging && i) { //if we're in dragging mode, use the last pixel
            state.ctx.moveTo(pixels[i - 1].x * w, pixels[i - 1].y * h);
          } else { //else use the current pixel, offset by 1px to the left
            state.ctx.moveTo(pixels[i].x * w - 1, pixels[i].y * h);
          }
          state.ctx.lineTo(pixels[i].x * w, pixels[i].y * h);//draw a line from point mentioned above to the current pixel
          state.ctx.closePath();//end the line
          state.ctx.stroke();//draw the line
        }
      }

      return { ...state };
    }
    default:
      throw new Error();
  }
}

export default function Canvas({ backgroundImage, imageLoaded, socket, socketOpen, user, meetingId, initialPixels, ownerId, setLoading }) {

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

  const [, dispatch] = useReducer(reducer, {
    pixelArrays: { ...initialPixels },
    ctx: undefined
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
      return () => {
        socket.off('drawClick');
      };
    }
  }, [socket, socketOpen, user.id]);

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
    //Uncomment this if you want the user to
    let pixel = {
      x: x,
      y: y,
      dragging: dragging
    };
    dispatch({ type: SET_PIXEL, payload: { user: user.id, pixel: mapToRelativeUnits(pixel) } });
    dispatch({ type: REDRAW });
    // mergeWithImage();
  };

  const handleMouseDown = e => {
    let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
    let mouseY = e.pageY - drawCanvasRef.current.offsetTop;
    addClick(mouseX, mouseY);
    let pixel = { x: mouseX, y: mouseY, dragging: false };
    setPaint(true);
    mapToRelativeUnits(pixel);
    socket.emit('addClick', { user: user, pixel: pixel, meetingId: meetingId, code: user.id });
  }

  const handleMouseMove = e => { //Change to useCallback??
    if (paint) {
      let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
      let mouseY = e.pageY - drawCanvasRef.current.offsetTop
      addClick(mouseX, mouseY, true);
      let pixel = { x: mouseX, y: mouseY, dragging: true };
      mapToRelativeUnits(pixel);
      socket.emit('addClick', { user: user, pixel: pixel, meetingId: meetingId, code: user.id });
    }
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
        onMouseUp={e => setPaint(false)}
        // onMouseUp={e => handleMouseUp(e.nativeEvent)}
        onMouseLeave={e => setPaint(false)}
        onTouchStart={e => handleMouseDown(e.nativeEvent.touches[0])}
        onTouchMove={e => handleMouseMove(e.nativeEvent.touches[0])}
        onTouchEnd={e => setPaint(false)}
      >
      </canvas>
      {user.id === ownerId && <Button
        variant='contained'
        color='secondary'
        className={classes.endMeeting}
        onClick={endMeeting}
      >
        End Meeting
        </Button>}
    </div>
  )
}
