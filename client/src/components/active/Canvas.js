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
    console.log("redrawing");
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
    console.log("MOUSE DOWN")
    let mouseX = e.pageX - canvasRef.current.offsetLeft;
    let mouseY = e.pageY - canvasRef.current.offsetTop;
    console.log(mouseX, mouseY);
    setPaint(true);
    addClick(mouseX, mouseY);
    redraw();
  }

  const handleTouchStart = e => {
    let touch = e.touches[0];
    // handleMouseDown(e);
    // setPaint(true);

    // let mouseEvent = new MouseEvent("mousedown", {
    //   clientX: touch.clientX,
    //   clientY: touch.clientY,
    //   pageX: touch.pageX,
    //   pageY: touch.pageY
    // });

    let mouseX = touch.pageX - canvasRef.current.offsetLeft;
    let mouseY = touch.pageY - canvasRef.current.offsetTop;

    setPaint(true);
    addClick(mouseX, mouseY);
    redraw();
    // canvasRef.current.dispatchEvent(mouseEvent);
    // let mouseX = e.pageX - canvasRef.current.offsetLeft;
    // let mouseY = e.pageY - canvasRef.current.offsetTop;
    // console.log(mouseX, mouseY);
    // setPaint(true);
    // addClick(mouseX, mouseY);
    // redraw();
  }

  const handleTouchMove = e => {
    console.log("TOUCH MOVE")
    let touch = e.touches[0];
    // setPaint(true);
    // console.log(touch);
    // handleMouseDown(e);
    // let mouseEvent = new MouseEvent("mousemove", {
    //   isTrusted: true,
    //   clientX: touch.clientX,
    //   clientY: touch.clientY,
    //   pageX: touch.pageX,
    //   pageY: touch.pageY
    // });
    // console.log(mouseEvent);
    // canvasRef.current.dispatchEvent(mouseEvent);

    if (paint) {
      console.log("actually moving")
      addClick(touch.pageX - canvasRef.current.offsetLeft, touch.pageY - canvasRef.current.offsetTop, true);
      // console.log(e.pageX);
      redraw();
      // debugger;
    }

  }

  const handleMouseMove = e => {
    console.log("trying to move")
    if (paint) {
      console.log("actually moving")
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
      onTouchStart={e => handleTouchStart(e.nativeEvent)}
      onTouchMove={e => handleTouchMove(e.nativeEvent)}
      onTouchEnd={e => setPaint(false)}
    >
    </canvas>
  );
}
