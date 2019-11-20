import React from 'react';

import CollapsedView from './CollapsedView';
import AttendeeView from './AttendeeView';
import OwnerView from './OwnerView';

const meetings = [
  {
    id: 1,
    start_time: 'January 8 04:05:06 2020 PST',
    end_time: null,
    name: 'test1',
    owner_username: 'John Smith',
    status: 'scheduled',
    notes: 'blahblahblahblahblah',
    invited_users: ['tc', 'ta', 'oj']
  },
  {
    id: 2,
    start_time: 'January 9 04:05:06 2020 PST',
    end_time: null,
    name: 'test2',
    owner_username: 'John Smith',
    status: 'scheduled',
    notes: 'blahblahblahblahblah',
    invited_users: ['tc', 'ta', 'oj']
  },
  {
    id: 3,
    start_time: 'January 10 04:05:06 2020 PST',
    end_time: null,
    name: 'test3',
    owner_username: 'John Smith',
    status: 'scheduled',
    notes: 'blahblahblahblahblah',
    invited_users: ['tc', 'ta']
  }
];

export default function Dashboard() {

  const [expand, setExpand] = React.useState(false);

  const expandHandler = (id) => {
    if (expand === false) {
      setExpand(true)
    } else {
      setExpand(false);
    }
  }

  const list = meetings.map(meeting => {
    return (
      <>
        {!expand && <CollapsedView
          key={meeting.id}
          startTime={meeting.start_time}
          name={meeting.name}
          owner={meeting.owner_username}
          attendees={meeting.invited_users}
          onClick={expandHandler}
        />}
        {expand && <AttendeeView
          key={meeting.id}
          startTime={meeting.start_time}
          name={meeting.name}
          owner={meeting.owner_username}
          attendees={meeting.invited_users}
          notes={meeting.notes}
          onClick={expandHandler}
        />}
      </>
    )
  })

  return (
    <div>
      <h1>Upcoming Meetings</h1>
      {list}
    </div>
  );
}
