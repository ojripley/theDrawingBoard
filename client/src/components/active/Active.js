import React, { useState, useEffect } from 'react';
import theImage from './tmp.jpg';
import Canvas from './Canvas';
import ImageCanvas from './Image';

export default function Active({ socket, socketOpen }) {
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    if (socketOpen) {
      socket.emit(
        'GETIMAGE', data => { //Will get the image to be shown in background ?
          console.log(data);
        });
    }
  }, [socket, socketOpen]);

  let myImage = new Image();
  myImage.onload = () => { setLoaded(true) };
  myImage.src = theImage;

  return (
    <>
      <ImageCanvas myImage={myImage} isLoaded={isLoaded} />
      <Canvas />
    </>
  );
}
