import React, { useState, useEffect, useRef } from 'react';
import './Canvas.scss';

export default function Canvas({ ctx, setCtx, imageEl, isLoaded }) {

  //State for drawing canvas:
  const drawCanvasRef = useRef(null);
  let [paint, setPaint] = useState(false);
  let [clickX, setClickX] = useState([]);
  let [clickY, setClickY] = useState([]);
  let [clickDrag, setClickDrag] = useState([]);

  //State for image canvas:
  const imageCanvasRef = useRef(null);
  let [imageCtx, setImageCtx] = useState();

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
    setClickX([...clickX, x]);
    setClickY([...clickY, y]);
    setClickDrag([...clickDrag, dragging]);

    setImageCtx(prev => { //Move this to on save (meeting end. )
      prev = imageCanvasRef.current.getContext('2d')
      prev.drawImage(drawCanvasRef.current, 0, 0, window.innerWidth, window.innerHeight);
    });

  };

  const redraw = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the drawCanvas
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
    let mouseX = e.pageX - drawCanvasRef.current.offsetLeft;
    let mouseY = e.pageY - drawCanvasRef.current.offsetTop;
    setPaint(true);
    addClick(mouseX, mouseY);
    redraw();
  }

  const handleMouseMove = e => {
    if (paint) {
      addClick(e.pageX - drawCanvasRef.current.offsetLeft, e.pageY - drawCanvasRef.current.offsetTop, true);
      redraw();
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
