import React, { useRef, useState, useEffect } from 'react';
import './Image.scss';

export default function Image(props) {
  let imageEl = props.myImage;
  let isLoaded = props.isLoaded;
  // let loadingFn = props.onLoad;
  const imageCtxRef = useRef(null);
  // const imageEl = useRef(null);

  // let p = (
  //   <img
  //     ref={imageEl}
  //     src={image}
  //     alt='whatever'
  //   />
  // );
  // let canvas;

  let [ctx, setCtx] = useState();

  useEffect(() => {
    // define canvas
    imageCtxRef.current.width = window.innerWidth;
    imageCtxRef.current.height = window.innerHeight;
    setCtx(prev => {
      console.log("imageEl", imageEl);
      prev = imageCtxRef.current.getContext('2d')
      prev.drawImage(imageEl, 0, 0, 1920, 1080);
    });
    console.log(ctx);
  }, [ctx, isLoaded, imageEl]);


  return (
    <canvas
      id='image'
      ref={imageCtxRef}
    >
    </canvas>
  );
}
