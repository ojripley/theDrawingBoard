import React, { useState, useEffect } from 'react';
import theImage from './tmp.jpg';
import Canvas from './Canvas';
import ImageCanvas from './Image';

export default function Active({ socket, socketOpen }) {
  const [isLoaded, setLoaded] = useState(false);
  //TODO: Get upcoming meetings
  const [inMeeting, setInMeeting] = useState(true);//Change to JSON of next meeting

  //TODO: Add text input which will be sent to server on submit
  //TODO: Figure out how to display the messages that are being saved
  useEffect(() => {
    if (socketOpen) {
      socket.emit(
        'GETIMAGE', data => { //Will get the image to be shown in background ?
          console.log(data);
        });
    }
  }, [socket, socketOpen]);

  if (inMeeting) {
    let myImage = new Image();
    myImage.onload = () => { setLoaded(true) };
    myImage.src = theImage;

    return (
      <div id="canvas-container">
        <ImageCanvas myImage={myImage} isLoaded={isLoaded} />
        <Canvas />
      </div>
    )
  } else {
    return (
      <>
        <h1> No active meeting. </h1>
        <p> The next schedule meeting is [ ... ]</p>
        <img src="images/no_meeting.jpg" alt="Sad Pikachu" />
      </>
    )
  }
}
