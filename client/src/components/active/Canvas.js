import React, { useState, useEffect, useRef } from 'react';
import './Canvas.scss';

const ADD_USER = "ADD_USER";
const SET_INITIAL_PIXELS = "SET_INITIAL_PIXELS";
const SET_PIXEL = "SET_PIXEL";
const SET_CTX = "SET_CTX";
const REDRAW = "REDRAW";
const SET_POINTER = "SET_POINTER";

export default function Canvas({ backgroundImage, imageLoaded, socket, socketOpen, user, meetingId, ownerId, setLoading, pixelColor, strokeWidth, tool, page, canvasState, dispatch }) {
  const TRIGGER_ZONE = 15;



  //State for drawing canvas:
  const drawCanvasRef = useRef({});
  let [paint, setPaint] = useState(false);
  // const myCode = useRef(Math.floor(Math.random() * 1000), [])


  // console.log('initialPixels:', initialPixels)
  //State for image canvas:
  const imageCanvasRef = useRef(null);
  // let [imageCtx,] = useState();
  let imageCtx = useRef(undefined);

  //Loads the initial drawing canvas
  useEffect(() => {
    window.onresize = () => {
      drawCanvasRef.current.width = window.innerWidth;
      drawCanvasRef.current.height = backgroundImage.height === 0 ? window.innerHeight : (backgroundImage.height * window.innerWidth / backgroundImage.width);
      dispatch({ type: REDRAW, payload: { page: page } });
    }

    drawCanvasRef.current.width = window.innerWidth;
    drawCanvasRef.current.height = backgroundImage.height === 0 ? window.innerHeight : (backgroundImage.height * window.innerWidth / backgroundImage.width);
    const newCtx = drawCanvasRef.current.getContext('2d');
    dispatch({
      type: SET_CTX,
      payload: newCtx
    });
    dispatch({ type: REDRAW, payload: { page: page } });


    return () => {
      window.onresize = undefined;
    }


  }, [imageLoaded, backgroundImage, dispatch, page]);

  const mapToRelativeUnits = (pixel) => {
    let w = drawCanvasRef.current.width;
    let h = drawCanvasRef.current.height;
    pixel.x = pixel.x / w;
    pixel.y = pixel.y / h;
    return pixel;
  }



  useEffect(() => {
    if (socketOpen) {
      socket.on('drawClick', data => {
        if (user.id !== data.user.id) {
          console.log("Other person is drawing", data.user.id);

          dispatch({ type: SET_PIXEL, payload: { user: data.user.id, pixel: data.pixel, page: page } });
          dispatch({ type: REDRAW, payload: { page: page } });
        }
      });

      socket.on('setPointer', data => {
        if (user.id !== data.user.id) {
          console.log("Other person is pointing", data.user.id);
          dispatch({ type: SET_POINTER, payload: { user: data.user.id, pixel: data.pixel } });
          dispatch({ type: REDRAW, payload: { page: page } });
        }
      });


      return () => {
        socket.off('drawClick');
        socket.off('setPointer');
      };
    }
  }, [socket, socketOpen, user.id, dispatch, page]);

  useEffect(() => {
    if (socketOpen) {
      socket.on('redraw', (data) => {
        console.log('redrawing pixels!');
        dispatch({ type: SET_INITIAL_PIXELS, payload: data.pixels });
        dispatch({ type: REDRAW, payload: { page: page } });
      });

      socket.on('newParticipant', data => {
        console.log('New user joined jlkjlkjlkjlkjlk', data);
        console.log(data.color);
        dispatch({ type: ADD_USER, payload: { user: data.user.id, color: data.color } });
      });


      return () => {
        socket.off('redraw');
        socket.off('newParticipant');
      };
    }
  }, [socket, socketOpen, user.id, dispatch, page]);





  //Sets the image canvas after it has loaded (and upon any changes in image)
  useEffect(() => {
    // setImageCtx(prev => {

    imageCanvasRef.current.width = window.innerWidth;
    imageCanvasRef.current.height = backgroundImage.height === 0 ? window.innerHeight : (backgroundImage.height * window.innerWidth / backgroundImage.width);
    imageCtx.current = imageCanvasRef.current.getContext('2d');

    if (backgroundImage.src) {
      imageCtx.current.drawImage(backgroundImage, 0, 0, imageCanvasRef.current.width, imageCanvasRef.current.height);
    }
    // dispatch({ type: SET_INITIAL_PIXELS, payload: initialPixels })
    dispatch({ type: REDRAW, payload: { page: page } });
    // });
  }, [imageCtx.current, imageLoaded, backgroundImage]);

  const addClick = (x, y, dragging) => {
    if (tool === "pointer") {
      let pixel =
      {
        x: x,
        y: y,
        strokeWidth: strokeWidth //may not use
      };
      let prevPix = canvasState.pointers[user.id];
      let w = drawCanvasRef.current.width;
      let h = drawCanvasRef.current.height;

      if (!prevPix ||
        (x - prevPix.x * w) ** 2 + (y - prevPix.y * h) ** 2 > TRIGGER_ZONE ** 2) {
        mapToRelativeUnits(pixel);
        dispatch({ type: SET_POINTER, payload: { user: user.id, pixel: pixel } });
        dispatch({ type: REDRAW, payload: { page: page } });
        socket.emit('setPointer', { user: user, pixel: pixel, meetingId: meetingId, page: page });
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
      dispatch({ type: SET_PIXEL, payload: { user: user.id, pixel: pixel, page: page } });
      dispatch({ type: REDRAW, payload: { page: page } });
      socket.emit('addClick', { user: user, pixel: pixel, meetingId: meetingId, page: page });
    }
  };

  const handleMouseDown = e => {
    let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
    let mouseY = e.pageY - drawCanvasRef.current.offsetTop;
    addClick(mouseX, mouseY, false);
    // if (tool !== "pointer") { //potentially fixes bug where initial pixel would sometime be in dragging state
    setPaint(true);
    // }
  }

  const handleMouseMove = e => { //Change to useCallback??
    if (paint /*|| tool === "pointer"*/) { //add commented line if pointer should always be on when selected.
      let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
      let mouseY = e.pageY - drawCanvasRef.current.offsetTop;
      addClick(mouseX, mouseY, true);
    }
  }

  const handleMouseUp = e => {
    setPaint(false);
    //Clear the pointer pixel:
    if (tool === "pointer") {
      dispatch({ type: SET_POINTER, payload: { user: user.id, pixel: undefined } });
      socket.emit('setPointer', { user: user, pixel: undefined, meetingId: meetingId });
      dispatch({ type: REDRAW, payload: { page: page } });
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
        onMouseUp={e => handleMouseUp(e.nativeEvent)}
        onMouseLeave={e => handleMouseUp(e.nativeEvent)}
        onTouchStart={e => handleMouseDown(e.nativeEvent.touches[0])}
        onTouchMove={e => handleMouseMove(e.nativeEvent.touches[0])}
        onTouchEnd={e => handleMouseUp(e.nativeEvent.touches[0])}
      >
      </canvas>

    </div>
  )
}
