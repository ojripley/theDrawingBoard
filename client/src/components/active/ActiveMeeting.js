import React, { useState, useEffect } from 'react';
import theImage from './tmp.jpg';
import Canvas from './Canvas';
import ImageCanvas from './Image';

import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';


const useStyles = makeStyles(theme => ({
  fab: {
    margin: theme.spacing(1),
    position: "absolute",
    bottom: 0,
    right: 0,
    margin: "10px"
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  textareaAutosize: {
    position: "absolute",
    bottom: 0,
    width: '100%'
  }
}));

export default function Active({ socket, socketOpen, initialNotes }) {
  const [isLoaded, setLoaded] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState(initialNotes);

  const classes = useStyles();

  //TODO: Add text input which will be sent to server on submit
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
    <div id="canvas-container">
      <ImageCanvas myImage={myImage} isLoaded={isLoaded} />
      <Canvas />
      <Fab color="secondary" aria-label="edit" className={classes.fab}>
        <EditIcon onClick={() => console.log("click")} />
      </Fab>
      <TextareaAutosize aria-label="empty textarea" placeholder="Empty" />
    </div>
  )

}
