import React from 'react';

import './Dashboard.scss';

import MeetingCard from './MeetingCard';
import Form from './Form';

const currentUser = {
  id: 1,
  username: 'John Smith',
  email: 'j@smith.com'
}

const meetings = [
  {
    id: 1,
    start_time: 'January 8 04:05:06 2020 PST',
    end_time: null,
    name: 'test1',
    owner_username: 'John Smith',
    status: 'scheduled',
    description: 'blah',
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
    description: 'blah',
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
    description: 'blah',
    notes: 'blahblahblahblahblah',
    invited_users: ['tc', 'ta']
  }
];

export default function Dashboard() {

  const list = meetings.map(meeting => {

    return (
      <li className='meeting-list-item' key={meeting.id}>
        <MeetingCard
          startTime={meeting.start_time}
          name={meeting.name}
          owner={meeting.owner_username}
          attendees={meeting.invited_users}
          description={meeting.description}
          user={currentUser.username}
        />
      </li>
    )
  })

  return (
    <div>
      <h1>Upcoming Meetings</h1>
      <Form />
      <ul className='meeting-list'>
        {list}
      </ul>
    </div>
  );
}
