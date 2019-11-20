import React from 'react';

import Contact from './Contact';



// boiled data
// will be replaced with an axios call
friends = [
  {
    id: 2,
    username: 'ta',
    email: 'ta@mail.com'
  },
  {
    id: 3,
    username: 'tc',
    email: 'tc@mail.com'
  },
]



export default function Contacts(props) {

  const contacts = friends.map(friend => {
    <Contact
      key={friend.id}
      username={friend.username}
      email={friend.email}
    />
  });

  return (
    <>
      <h1>Contacts</h1>
      <ul>
        {contacts}
      </ul>
    </>
  );
}
