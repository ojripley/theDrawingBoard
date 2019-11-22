import React, { useState, useEffect, useRef, useReducer } from 'react';
import './Canvas.scss';

const SET_X = "SET_X";
const SET_Y = "SET_Y";
const SET_DRAG = "SET_DRAG";
const SET_CTX = "SET_CTX";
const REDRAW = "REDRAW";

function reducer(state, action) {
  switch (action.type) {
    case SET_X:
      return { ...state, clickX: { ...state.clickX, [action.payload.user]: action.payload.x } };
    case SET_Y:
      return { ...state, clickY: { ...state.clickY, [action.payload.user]: action.payload.y } };
    // return { ...state, clickY: [...state.clickY, action.payload.y] };
    case SET_DRAG:
      return { ...state, clickDrag: { ...state.clickX, [action.payload.user]: action.payload.drag } };
    // return { ...state, clickDrag: [...state.clickDrag, action.payload.drag] };
    case SET_CTX:
      return { ...state, ctx: action.payload };
    case REDRAW: {
      console.log(state.clickX)
      state.ctx.clearRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height); // Clears the drawCanvas
      state.ctx.lineJoin = "round";
      state.ctx.lineWidth = 2;
      state.ctx.strokeStyle = '#00000';

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
      return { ...state };
    }
    default:
      throw new Error();
  }
}

export default function Canvas({ imageEl, isLoaded, socket, socketOpen, user }) {

  //State for drawing canvas:
  const drawCanvasRef = useRef(null);
  let [paint, setPaint] = useState(false);
  const myCode = useRef(Math.floor(Math.random() * 1000), [])

  const [drawingState, dispatch] = useReducer(reducer, {
    clickX: { [myCode]: [] },
    clickY: { [myCode]: [] },
    clickDrag: { [myCode]: [] },
    ctx: undefined
  });


  //State for image canvas:
  const imageCanvasRef = useRef(null);
  let [imageCtx, setImageCtx] = useState();


  // const redraw = () => {
  //   console.log(drawingState.clickX)
  //   drawingState.ctx.clearRect(0, 0, drawingState.ctx.canvas.width, drawingState.ctx.canvas.height); // Clears the drawCanvas
  //   drawingState.ctx.lineJoin = "round";
  //   drawingState.ctx.lineWidth = 2;
  //   drawingState.ctx.strokeStyle = '#00000';

  //   for (let i = 0; i < drawingState.clickX.length; i++) {
  //     drawingState.ctx.beginPath();
  //     if (drawingState.clickDrag[i] && i) {
  //       drawingState.ctx.moveTo(drawingState.clickX[i - 1], drawingState.clickY[i - 1]);
  //     } else {
  //       drawingState.ctx.moveTo(drawingState.clickX[i] - 1, drawingState.clickY[i]);
  //     }
  //     drawingState.ctx.lineTo(drawingState.clickX[i], drawingState.clickY[i]);
  //     drawingState.ctx.closePath();
  //     drawingState.ctx.stroke();
  //   }
  // };

  useEffect(() => {
    if (socketOpen) {
      // socket.emit('fetchMeetings', { username: user.username, meetingStatus: 'scheduled' });
      socket.on('drawClick', data => {
        // console.log(data.pixel.x);
        console.log(user);
        console.log(data.code);
        if (myCode.current !== data.code) {
          dispatch({ type: SET_X, payload: data.pixel.x });
          dispatch({ type: SET_Y, payload: data.pixel.y });
          dispatch({ type: SET_DRAG, payload: data.pixel.dragging });
          dispatch({ type: REDRAW });
          /*
          dispatch({ type: SET_X, payload: { user: myCode, x: data.mouse.x } });
          dispatch({ type: SET_Y, payload: { user: myCode, y: data.mouse.y } });
          dispatch({ type: SET_DRAG, payload: { user: myCode, drag: data.mouse.dragging } });

          */
        }
      });
      console.log('done setting up the on')
      return () => {
        socket.off('drawClick');
      };
    }
  }, [socket, socketOpen, user.username]);



  //Sets the image canvas after it has loaded (and upon any changes in image)
  useEffect(() => {
    imageCanvasRef.current.width = window.innerWidth;
    imageCanvasRef.current.height = window.innerHeight;
    setImageCtx(prev => {
      prev = imageCanvasRef.current.getContext('2d')
      prev.drawImage(imageEl, 0, 0, window.innerWidth, window.innerHeight);
    });
  }, [imageCtx, isLoaded, imageEl]);

  //Loads the initial drawing canvas
  useEffect(() => {
    drawCanvasRef.current.width = window.innerWidth;
    drawCanvasRef.current.height = window.innerHeight;
    const newCtx = drawCanvasRef.current.getContext('2d')
    dispatch({
      type: SET_CTX,
      payload: newCtx
    });
    // setCtx(drawCanvasRef.current.getContext('2d'));
  }, []);

  const addClick = (x, y, dragging) => {
    //Uncomment this if you want the user to
    dispatch({ type: SET_X, payload: x });
    dispatch({ type: SET_Y, payload: y });
    dispatch({ type: SET_DRAG, payload: dragging });
    dispatch({ type: REDRAW });
  };


  const handleMouseDown = e => {
    let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
    let mouseY = e.pageY - drawCanvasRef.current.offsetTop;
    setPaint(true);
    addClick(mouseX, mouseY);
    socket.emit('addClick', { user, pixel: { x: mouseX, y: mouseY, dragging: false }, code: myCode.current });

    // redraw();
  }

  const handleMouseMove = e => { //Change to useCallback??
    if (paint) {
      let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
      let mouseY = e.pageY - drawCanvasRef.current.offsetTop
      addClick(mouseX, mouseY, true);
      socket.emit('addClick', { user, pixel: { x: mouseX, y: mouseY, dragging: true }, code: myCode.current });
      // redraw();
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
        onMouseLeave={e => setPaint(false)}
        onTouchStart={e => handleMouseDown(e.nativeEvent.touches[0])}
        onTouchMove={e => handleMouseMove(e.nativeEvent.touches[0])}
        onTouchEnd={e => setPaint(false)}
      >
      </canvas>
    </div>
  );
}
