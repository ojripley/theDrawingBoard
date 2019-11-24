import React, { useEffect, useState } from 'react';

import RelationEditButton from './RelationEditButton';

import Card from '@material-ui/core/Card';
import PersonOutlineOutlinedIcon from '@material-ui/icons/PersonOutlineOutlined';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';


import './Contacts.scss';

export default function Contact(props) {

  const [contact, setContact] = useState(props.contact.relation);

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.emit('addContact', {user: props.user, id: props.contact.id});

      props.socket.on('contactAdded', (data) => {
        setContact(true);
      })
    }
  })

  const relationStatus = 'temp';


  return(
      <Card className='contact-card'>
        <PersonOutlineOutlinedIcon className='contact-icon'></PersonOutlineOutlinedIcon>
        <span className='contact-username'>{props.contact.username} </span>
        <span className='contact-email'>{props.contact.email}</span>
        {/* <RelationEditButton
          user={props.user}
          contact={props.contact}
          onClick={setContact}
        /> */}

      </Card>
  );
}
