import React, { useRef, useState, useEffect } from 'react';
import './Image.scss';

export default function Image(props) {
  let imageEl = props.myImage;
  let isLoaded = props.isLoaded;
  const imageCtxRef = useRef(null);
  let [ctx, setCtx] = useState();

  useEffect(() => {
    imageCtxRef.current.width = window.innerWidth;
    imageCtxRef.current.height = window.innerHeight;
    setCtx(prev => {
      prev = imageCtxRef.current.getContext('2d')
      prev.drawImage(imageEl, 0, 0, window.innerWidth, window.innerHeight);
    });
  }, [ctx, isLoaded, imageEl]);


  return (
    <canvas
      id='image'
      ref={imageCtxRef}
    >
    </canvas>
  );
}
