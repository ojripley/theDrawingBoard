import React, { useState, useEffect, useRef } from 'react';
import './Canvas.scss';

const ADD_USER = "ADD_USER";
const SET_INITIAL_PIXELS = "SET_INITIAL_PIXELS";
const SET_PIXEL = "SET_PIXEL";
const SET_CTX = "SET_CTX";
const REDRAW = "REDRAW";
const SET_POINTER = "SET_POINTER";

export default function Canvas({ backgroundImage,
  imageLoaded,
  socket,
  socketOpen,
  user,
  meetingId,
  strokeWidth,
  tool,
  page,
  canvasState,
  dispatch,
  setShowButtons }) {
  const TRIGGER_ZONE = 15; //Prevents pointer from continously sending socket event
  const drawCanvasRef = useRef({});
  let [paint, setPaint] = useState(false);

  const imageCanvasRef = useRef(null);
  let imageCtx = useRef(undefined);

  //Scale the image up/down to use max amount of screen as possible without changing aspect ratio
  const getScaledDimensions = (h, w, bh, bw) => {
    let imageRatio = bw / bh;
    let screenRatio = w / h;

    if (screenRatio >= imageRatio) {
      return [bw * (h / bh), h];
    } else {
      return [w, bh * (w / bw)];
    }
  }

  //Loads the initial drawing canvas & resizes images dynamically
  useEffect(() => {
    window.onresize = () => {
      [drawCanvasRef.current.width, drawCanvasRef.current.height] = getScaledDimensions(window.innerHeight, window.innerWidth, backgroundImage.height, backgroundImage.width);
      [imageCanvasRef.current.width, imageCanvasRef.current.height] = getScaledDimensions(window.innerHeight, window.innerWidth, backgroundImage.height, backgroundImage.width);
      imageCtx.current = imageCanvasRef.current.getContext('2d');
      if (backgroundImage.src) {
        imageCtx.current.drawImage(backgroundImage, 0, 0, imageCanvasRef.current.width, imageCanvasRef.current.height);
      }
      dispatch({ type: REDRAW, payload: { page: page } });
    }
    [drawCanvasRef.current.width, drawCanvasRef.current.height] = getScaledDimensions(window.innerHeight, window.innerWidth, backgroundImage.height, backgroundImage.width);
    [imageCanvasRef.current.width, imageCanvasRef.current.height] = getScaledDimensions(window.innerHeight, window.innerWidth, backgroundImage.height, backgroundImage.width);
    imageCtx.current = imageCanvasRef.current.getContext('2d');

    if (backgroundImage.src) {
      imageCtx.current.drawImage(backgroundImage, 0, 0, imageCanvasRef.current.width, imageCanvasRef.current.height);
    }

    const newCtx = drawCanvasRef.current.getContext('2d');

    dispatch({
      type: SET_CTX,
      payload: newCtx
    });
    dispatch({ type: REDRAW, payload: { page: page } });


    return () => {
      window.onresize = undefined; //cleanup listener
    }
  }, [imageLoaded, backgroundImage, dispatch, page, drawCanvasRef.current, imageCtx.current]);

  //Pixels must be mapped to relative units (% of width/height) so all parties can draw to their own screen properly
  const mapToRelativeUnits = (pixel) => {
    let w = drawCanvasRef.current.width;
    let h = drawCanvasRef.current.height;
    pixel.x = pixel.x / w;
    pixel.y = pixel.y / h;
    return pixel;
  }

  //Events coming from server trigger redrawing of canvas
  useEffect(() => {
    if (socketOpen) {
      socket.on('drawClick', data => {
        if (user.id !== data.user.id) {
          dispatch({ type: SET_PIXEL, payload: { user: data.user.id, pixel: data.pixel, page: page } });
          dispatch({ type: REDRAW, payload: { page: page } });
        }
      });

      socket.on('setPointer', data => {
        if (user.id !== data.user.id) {
          dispatch({ type: SET_POINTER, payload: { user: data.user.id, pixel: data.pixel } });
          dispatch({ type: REDRAW, payload: { page: page } });
        }
      });

      socket.on('redraw', (data) => {
        dispatch({ type: SET_INITIAL_PIXELS, payload: data.pixels });
        dispatch({ type: REDRAW, payload: { page: page } });
      });

      socket.on('addUserAndColor', data => {
        dispatch({ type: ADD_USER, payload: { user: data.user.id, color: data.color } });
      });
    }
    return () => {
      socket.off('drawClick');
      socket.off('setPointer');
      socket.off('redraw');
      socket.off('addUserAndColor');
    };

  }, [socket, socketOpen, user.id, dispatch, page]);

  //When a user clicks or touches the screen we must
  // 1) draw on client's canvas based on the tool selected
  // 2) emit to the server so all other users are aware.
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

      //Only emit/redraw if you have moved away more than a certain number of pixels from the original location (a certain radius away)
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
    setPaint(true);
    setShowButtons(false);
  }

  const handleMouseMove = e => {
    if (paint) {
      let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
      let mouseY = e.pageY - drawCanvasRef.current.offsetTop;
      addClick(mouseX, mouseY, true);
    }
  }

  const handleMouseUp = e => {
    setPaint(false);
    setShowButtons(true);
    //Clear the pointer pixel:
    if (tool === "pointer") {
      dispatch({ type: SET_POINTER, payload: { user: user.id, pixel: undefined } });
      socket.emit('setPointer', { user: user, pixel: undefined, meetingId: meetingId });
      dispatch({ type: REDRAW, payload: { page: page } });
    }
  }

  useEffect(() => { //on dismount, show buttons (open drawer)
    return () => {
      setShowButtons(true);
    }
  }, []);

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
