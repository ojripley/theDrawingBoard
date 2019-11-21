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
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight * 0.8;
    setCtx(canvasRef.current.getContext('2d'));
  }, []);

  const addClick = (x, y, dragging) => {
    setClickX([...clickX, x]);
    setClickY([...clickY, y]);
    setClickDrag([...clickDrag, dragging]);
  };

  const redraw = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00000';

    for (let i = 0; i < clickX.length; i++) {
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
    setPaint(true);
    addClick(mouseX, mouseY);
    redraw();
  }

  const handleMouseMove = e => {
    if (paint) {
      addClick(e.pageX - canvasRef.current.offsetLeft, e.pageY - canvasRef.current.offsetTop, true);
      redraw();
    }
  }

  return (
    <canvas
      id='canvas'
      ref={canvasRef}
      onMouseDown={e => handleMouseDown(e.nativeEvent)}
      onMouseMove={e => handleMouseMove(e.nativeEvent)}
      onMouseUp={e => setPaint(false)}
      onMouseLeave={e => setPaint(false)}
      onTouchStart={e => handleMouseDown(e.nativeEvent.touches[0])}
      onTouchMove={e => handleMouseMove(e.nativeEvent.touches[0])}
      onTouchEnd={e => setPaint(false)}
    >
    </canvas>
  );
}
