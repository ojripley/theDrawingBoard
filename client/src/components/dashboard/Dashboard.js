import React, { useState, useEffect } from 'react';

import './Dashboard.scss';

import MeetingCard from './MeetingCard';
import FormDialog from './FormDialog';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

export default function Dashboard(props) {

  const currentUser = props.user;

  const [meetings, setMeetings] = useState([]);
  const [expanded, setExpanded] = useState(false);



  useEffect(() => {
    if (props.socketOpen) {
      props.socket.emit('fetchMeetings', { username: currentUser.username, meetingStatus: 'scheduled' });
      props.socket.on('meetings', data => {
        // console.log('handling')
        setMeetings(data);
      });

      props.socket.on('itWorkedThereforeIPray', data => {
        console.log('new meeting', data);
        setMeetings(prev => {
          const newMeetings = [...prev, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
          console.log(newMeetings)
          return newMeetings;
        });
      });

      props.socket.on('meetingDeleted', (res) => {
        console.log('meeting deleted', res);
        setMeetings(prev => prev.filter(meeting => meeting.id !== res.id));
      });

      return () => {
        props.socket.off('meetings');
        props.socket.off('itWorkedThereforeIPray');
        props.socket.off('meetingDeleted');
      };
    }
  }, [props.socket, props.socketOpen, currentUser.username]);

  const meetingsList = meetings.map(meeting => {

    const attendees = [];

    for (let i = 0; i < meeting.attendee_ids.length; i++) {
      if (meeting.attendee_ids[i] === props.user.id) {
        currentUser['attendance'] = meeting.attendances[i];
      }
      attendees.push(
        {
          id: meeting.attendee_ids[i],
          username: meeting.invited_users[i],
          attendance: meeting.attendances[i]
        }
      )
    };

    return (
      <li className='meeting-list-item' key={meeting.id}>
        <MeetingCard
          id={meeting.id}
          startTime={meeting.start_time}
          name={meeting.name}
          owner={meeting.owner_username}
          attendees={attendees}
          attendeeIds={meeting.attendee_ids}
          description={meeting.description}
          active={meeting.active}
          user={currentUser}
          expanded={expanded}
          setExpanded={setExpanded}
          socket={props.socket}
          socketOpen={props.socketOpen}
          setInMeeting={props.setInMeeting}
          setMeetingId={props.setMeetingId}
          setOwnerId={props.setOwnerId}
          setBackgroundImage={props.setBackgroundImage}
          setImageLoaded={props.setImageLoaded}
          setInitialPixels={props.setInitialPixels}
          setMeetingNotes={props.setMeetingNotes}
          setPixelColor={props.setPixelColor}
        />
      </li>
    )
  });

  return (
    <>
      <Typography id='page-header' variant='h2' color='primary'>Upcoming Meetings</Typography>
      <Divider />
      <ul className='meeting-list'>
        {meetingsList}
      </ul>
      <FormDialog
        socket={props.socket}
        socketOpen={props.socketOpen}
        user={currentUser}
      />
    </>
  );
}
