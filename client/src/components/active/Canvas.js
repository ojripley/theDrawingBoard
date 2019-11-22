import React, { useState, useEffect, useRef, useReducer } from 'react';
import './Canvas.scss';

const SET_X = "SET_X";
const SET_Y = "SET_Y";
const SET_DRAG = "SET_DRAG";
const SET_CTX = "SET_CTX";

function reducer(state, action) {
  switch (action.type) {
    case SET_X:
      return { count: state.count + 1 };
    case SET_Y:
      return { count: state.count - 1 };
    case SET_DRAG:
      return { count: state.count - 1 };
    case SET_CTX:
      return { count: state.count - 1 };
    default:
      throw new Error();
  }

}

export default function Canvas({ imageEl, isLoaded, socket, socketOpen, user }) {

  //State for drawing canvas:
  const drawCanvasRef = useRef(null);
  let [paint, setPaint] = useState(false);

  // const [drawingState, dispatch] = useReducer({
  //   clickX: [],
  //   clickY: [],
  //   clickDrag: [],
  //   ctx: undefined
  // });


  //These four are reducered:
  let [clickX, setClickX] = useState([]);
  let [clickY, setClickY] = useState([]);
  let [clickDrag, setClickDrag] = useState([]);
  let [ctx, setCtx] = useState(); //Writing screen context


  //State for image canvas:
  const imageCanvasRef = useRef(null);
  let [imageCtx, setImageCtx] = useState();


  const redraw = (curCtx = ctx, curClickX = clickX, curClickY = clickY, curClickDrag = clickDrag) => {
    console.log(curClickX)
    curCtx.clearRect(0, 0, curCtx.canvas.width, curCtx.canvas.height); // Clears the drawCanvas
    curCtx.lineJoin = "round";
    curCtx.lineWidth = 2;
    curCtx.strokeStyle = '#00000';

    for (let i = 0; i < curClickX.length; i++) {
      curCtx.beginPath();
      if (curClickDrag[i] && i) {
        curCtx.moveTo(curClickX[i - 1], curClickY[i - 1]);
      } else {
        curCtx.moveTo(curClickX[i] - 1, curClickY[i]);
      }
      curCtx.lineTo(curClickX[i], curClickY[i]);
      curCtx.closePath();
      curCtx.stroke();
    }
  };

  // Sample request
  useEffect(() => {
    if (socketOpen) {
      // socket.emit('fetchMeetings', { username: user.username, meetingStatus: 'scheduled' });
      socket.on('drawClick', data => {
        console.log(data.mouse.x);
        let updatedX = [];
        let updatedY = [];
        let updatedDragging = [];
        setClickX((prev) => {
          updatedX = [...prev, data.mouse.x]
          return [...prev, data.mouse.x];
        });
        setClickY((prev) => {
          updatedY = [...prev, data.mouse.y]
          return [...prev, data.mouse.y];
        });
        setClickDrag((prev) => {
          updatedDragging = [...prev, data.mouse.dragging];
          return [...prev, data.mouse.dragging];
        });
        // setClickY((prev) => [...prev, data.mouse.y]);
        setCtx((prev) => { //dumb
          console.log("REDRAWING")
          redraw(prev, updatedX, updatedY, updatedDragging);

          return prev;
        })
        // console.log(clickX);
        // addClick(data.mouse.x, data.mouse.y);
      });
      console.log('done setting up the on')
      // return () => {
      //   socket.off('drawClick');
      // };
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
    setCtx(drawCanvasRef.current.getContext('2d'));
  }, []);

  const addClick = (x, y, dragging) => {
    // setClickX([...clickX, x]);
    // setClickY([...clickY, y]);
    // setClickDrag([...clickDrag, dragging]);
    // redraw();
    // setImageCtx(prev => { //Move this to on save (meeting end. )
    //   prev = imageCanvasRef.current.getContext('2d')
    //   prev.drawImage(drawCanvasRef.current, 0, 0, window.innerWidth, window.innerHeight);
    // });

  };


  const handleMouseDown = e => {
    let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
    let mouseY = e.pageY - drawCanvasRef.current.offsetTop;
    setPaint(true);
    addClick(mouseX, mouseY);
    socket.emit('addClick', { username: user.username, mouse: { x: mouseX, y: mouseY, dragging: false } });

    // redraw();
  }

  const handleMouseMove = e => { //Change to useCallback??
    if (paint) {
      let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
      let mouseY = e.pageY - drawCanvasRef.current.offsetTop
      addClick(mouseX, mouseY, true);
      socket.emit('addClick', { username: user.username, mouse: { x: mouseX, y: mouseY, dragging: true } });
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
