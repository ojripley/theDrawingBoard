import React, { useState, useEffect } from 'react';
import theImage from './tmp.jpg';
import Canvas from './Canvas';
import ImageCanvas from './Image';
import useDebounce from "../../hooks/useDebounce";

import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import CircularProgress from '@material-ui/core/CircularProgress';



const useStyles = makeStyles(theme => ({
  fab: {
    margin: theme.spacing(1),
    position: "absolute",
    bottom: 0,
    left: 0,
    zIndex: 3
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  textareaAutosize: {
    position: "absolute",
    zIndex: 2,
    bottom: 20,
    right: 100,
    width: 200
  },
  root: {
    position: "absolute",
    bottom: 20,
    right: 50,
    zIndex: 3,
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(1),
    }
  }
}));

export default function ActiveMeeting({ socket, socketOpen, initialNotes, user }) {
  const [isLoaded, setLoaded] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState(initialNotes);
  const [writeMode, setWriteMode] = useState(false);
  const [saving, setSaving] = useState(true);
  const debouncedNotes = useDebounce(meetingNotes, 400);

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

  useEffect(() => {
    console.log(debouncedNotes);
    socket.emit('updated notes', { user, note: debouncedNotes });
  }, [socket, debouncedNotes])


  let myImage = new Image();
  myImage.onload = () => { setLoaded(true) };
  myImage.src = theImage;

  return (
    <>
      <div id="canvas-container">
        <ImageCanvas myImage={myImage} isLoaded={isLoaded} />
        <Canvas />
        <Fab
          aria-label="edit"
          color="secondary"
          className={classes.fab}
          onClick={() => setWriteMode(prev => !prev)} >
          <EditIcon />
        </Fab>
      </div>

      {writeMode &&
        <TextareaAutosize
          aria-label="empty textarea"
          placeholder="Empty"
          defaultValue={meetingNotes}
          className={classes.textareaAutosize}
          onChange={event => setMeetingNotes(event.target.value)}
        />
      }
      {saving &&
        <div className={classes.root}>
          <CircularProgress />
        </div>
      }
    </>
  )

}
