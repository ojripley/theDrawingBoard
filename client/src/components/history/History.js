import React, { useState, useEffect } from 'react';
import HistoryCard from './HistoryCard';
import DetailedHistory from './DetailedHistory';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import './History.scss';

export default function History(props) {

  const currentUser = props.user;

  const [meetings, setMeetings] = useState([]);
  const [viewMeeting, setViewMeeting] = useState(0);

  useEffect(() => { //jumps to top of page on mount
    window.scrollTo(0, 0)
  }, []);


  useEffect(() => {
    if (props.socketOpen) {
      props.socket.emit('fetchMeetings', { username: currentUser.username, meetingStatus: 'past' });
      props.socket.on('meetings', data => {
        console.log('fetched meetings')
        console.log(data)
        setMeetings(data)
      });

      return () => {
        props.socket.off('meetings');
      };
    }
  }, [props.socket, props.socketOpen, currentUser.username]);

  const displayDetailedHistory = (id) => {
    setViewMeeting(id);
  }

  const historyList = meetings.map(meeting => {
    return (
      <HistoryCard
        key={meeting.id}
        id={meeting.id}
        name={meeting.name}
        date={meeting.start_time}
        displayDetailedHistory={displayDetailedHistory}
      />
    )
  });

  return (
    <>
      {viewMeeting === 0 ? (
        <>
          <div>
            <Typography id='page-header' variant='h2' color='primary'>History</Typography>
            <Divider color='primary' />
          </div>
          {meetings.length < 1 ? <p className='app-message'>You have no recently concluded meetings. </p>
            : (<>
              <ul className='history-list'>
                {historyList}
              </ul></>)
          }
        </>
      ) : <DetailedHistory
          meeting={meetings.filter(meeting => meeting.id === viewMeeting)[0]}
          setViewMeeting={setViewMeeting}
          user={props.user}
          socket={props.socket}
          socketOpen={props.socketOpen}
        />
      }
    </>

  );
}
