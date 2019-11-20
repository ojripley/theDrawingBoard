import React from 'react';

export default function Contact(props) {
  return(
    <>
      <li className='contact-card'>
        <span>
          <h3>{props.username}</h3>
          <p>{props.email}</p>
        </span>
      </li>
    </>
  );
}
