import React, { useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CircularProgress from '@material-ui/core/CircularProgress';

import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

export default function DetailedHistory(props) {

  console.log('props for details', props);

  const notesRef = useRef(null);

  const [notes, setNotes] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.emit('fetchNotes', {user: props.user, meetingId: props.meeting.id, linkToFinalDoc: props.meeting.link_to_final_doc});
      props.socket.on('notesFetched', res => {
        console.log('on notes', res)
        setNotes(res.usersMeetings.notes);
        setImage(res.image);
      });

      return () => props.socket.off('notes');
    }
  }, [props.socket, props.meeting.id, props.user, props.meeting.link_to_final_doc, props.socketOpen]);

  const copyToClipboard = () => {
    console.log(notesRef.current.value)
    notesRef.current.select();
    document.execCommand('copy');
  }

  const time = props.meeting.start_time;

  return (
    <div id='detailed-history-container'>
      <div>
        <Typography id='page-header' variant='h2' color='primary'>{props.meeting.name}</Typography>
        <Divider color='primary' />
      </div>

      <Typography className='detailed-date' variant='button'>{new Date(time).toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        })}
      </Typography>

      {!image ? <CircularProgress color='secondary' /> :
        <>
          <div className='detailed-section'>
            <Typography variant='h6'>Hosted By</Typography>
            <Typography variant='body2'>{props.meeting.owner_username}</Typography>
          </div>

          <div className='detailed-section'>
            <Typography variant='h6'>Attendees</Typography>
            <Typography variant='body2'>{props.meeting.invited_users.map((name, index) => <span key={index}>{name} </span>)}</Typography>
          </div>

          {props.meeting.description && <div className='detailed-section'>
            <Typography variant='h6'>Description</Typography>
            <Typography variant='body2'>{props.meeting.description}</Typography>
          </div>}

          {notes && notes.length > 0 && <div className='detailed-section personal-notes'>
            <Typography variant='h6'>My Notes</Typography>
            <TextareaAutosize id='notes-text' className='MuiTypography-root MuiTypography-body2' ref={notesRef} value={notes} readOnly>
              {notes}
            </TextareaAutosize>
            <FileCopyIcon onClick={copyToClipboard} />
          </div>}

          <div className='detailed-section group-notes'>
            <Typography variant='h6'>Group Notes</Typography>
            <img className='meeting-image' src={image} alt='meeting-notes' />
          </div>
        </>
      }

      <Button variant="contained" onClick={() => props.setViewMeeting(0)}>Back</Button>
    </div>
  );
}
