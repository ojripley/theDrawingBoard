import React, { useState, useEffect, useRef } from 'react';
import './Canvas.scss';

export default function Canvas(props) {

  const canvasRef = useRef(null);

  let [ctx, setCtx] = useState();
  let [paint, setPaint] = useState(false);
  let [clickX, setClickX] = useState([]);
  let [clickY, setClickY] = useState([]);
  let [clickDrag, setClickDrag] = useState([]);

  useEffect(() => {
    // define canvas
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    // canvas = canvasRef.current;
    // console.log('inside useeffect', canvas);
    // set ctx
    setCtx(canvasRef.current.getContext('2d'));
  }, []);

  const addClick = (x, y, dragging) => {
    setClickX([...clickX, x]);
    setClickY([...clickY, y]);
    setClickDrag([...clickDrag, dragging]);
    // debugger;
  };

  const redraw = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas
    // debugger;
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00000';

    for (let i = 0; i < clickX.length; i++) {
      // console.log(ctx);
      ctx.beginPath();
      if (clickDrag[i] && i) {
        ctx.moveTo(clickX[i - 1], clickY[i - 1]);
      } else {
        ctx.moveTo(clickX[i] - 1, clickY[i]);
      }
      ctx.lineTo(clickX[i], clickY[i]);
      ctx.closePath();
      ctx.stroke();
    }
  }

  const handleMouseDown = e => {
    let mouseX = e.pageX - canvasRef.current.offsetLeft;
    let mouseY = e.pageY - canvasRef.current.offsetTop;
    // console.log(mouseX, mouseY);
    setPaint(true);
    addClick(mouseX, mouseY);
    redraw();
  }

  const handleMouseMove = e => {
    if (paint) {
      addClick(e.pageX - canvasRef.current.offsetLeft, e.pageY - canvasRef.current.offsetTop, true);
      // console.log(e.pageX);
      redraw();
      // debugger;
    }
  }

  // const handleMouseUp = e => {
  //   setPaint(false);
  // }

  // const handleMouseLeave = e => {
  //   setPaint(false);
  // }

  return (
    <canvas
      id='canvas'
      ref={canvasRef}
      onMouseDown={e => handleMouseDown(e.nativeEvent)}
      onMouseMove={e => handleMouseMove(e.nativeEvent)}
      onMouseUp={e => setPaint(false)}
      onMouseLeave={e => setPaint(false)}
    >
    </canvas>
  );
}
