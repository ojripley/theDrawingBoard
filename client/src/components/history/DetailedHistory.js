import React, { useState, useEffect, useRef } from 'react';

import { useTheme } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import MobileStepper from '@material-ui/core/MobileStepper';

export default function DetailedHistory(props) {

  const theme = useTheme();
  const notesRef = useRef(null);

  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [viewPage, setViewPage] = useState(0);

  const maxPages = images.length;
  const time = new Date(props.meeting.start_time).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });

  useEffect(() => {
    if (props.socketOpen) {

      // fetch personal notes and group images from server
      props.socket.emit('fetchNotes', { user: props.user, meetingId: props.meeting.id, link_to_initial_files: props.meeting.link_to_initial_files });
      props.socket.on('notesFetched', res => {
        setNotes(res.usersMeetings.notes);
        setImages(res.images);
      });

      return () => props.socket.off('notes');
    }
  }, [props.socket, props.meeting.id, props.user, props.meeting.link_to_final_doc, props.socketOpen]);

  const copyToClipboard = () => {
    notesRef.current.select();
    document.execCommand('copy');
  };

  const changePage = (direction) => {
    if (direction === 'back') {
      setViewPage(viewPage - 1);
    } else if (direction === 'next') {
      setViewPage(viewPage + 1);
    }
  };

  return (
    <div id='detailed-history-container'>
      <div id='page-header'>
        <div className='notifications-header'>
          <Typography variant='h2' color='primary'>{props.meeting.name}</Typography>
          <Button className='back-to-history' variant="outlined" color='secondary' size='small' onClick={() => props.setViewMeeting(0)}>Back</Button>
        </div>
        <Divider />
      </div>

      <Typography className='detailed-date' variant='button'>{time}</Typography>

      {images.length === 0 ? <CircularProgress className='history-spinner' color='secondary' /> :
        <>
          <div className='detailed-section'>
            <Typography variant='h6'>Hosted By</Typography>
            <Typography variant='body2'>{props.meeting.owner_username}</Typography>
          </div>

          <div className='detailed-section'>
            <Typography variant='h6'>Attendees</Typography>
            <Typography className='detailed-attendees' variant='body2'>{props.meeting.invited_users.map((name, index) => <li key={index}>{name}</li>)}</Typography>
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
            <img className='meeting-image' src={images[viewPage]} alt='meeting-notes' />
            <MobileStepper
              steps={maxPages}
              position="static"
              variant="text"
              activeStep={viewPage}
              nextButton={
                <Button size="small" onClick={() => changePage('next')} disabled={viewPage === maxPages - 1}>
                  Next
                  {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                </Button>
              }
              backButton={
                <Button size="small" onClick={() => changePage('back')} disabled={viewPage === 0}>
                  {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                  Back
                </Button>
              }
            />
          </div>
        </>
      }
    </div>
  );
}
