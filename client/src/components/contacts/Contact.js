import React from 'react';

import Card from '@material-ui/core/Card';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';


import './Contacts.scss';

export default function Contact(props) {
  return(
      <Card className='contact-card'>
        <PersonOutlineIcon className='contact-icon'></PersonOutlineIcon>
        <span className='contact-username'>{props.username} </span>
        <span className='contact-email'>{props.email}</span>
      </Card>
  );
}
