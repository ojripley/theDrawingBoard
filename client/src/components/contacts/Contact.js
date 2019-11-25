import React, { useEffect, useState } from 'react';

import Card from '@material-ui/core/Card';
import PersonOutlineOutlinedIcon from '@material-ui/icons/PersonOutlineOutlined';
import Button from '@material-ui/core/Button';



import './Contacts.scss';


export default function Contact(props) {

  // console.log(props.contact.username, props.contact.relation);
  const [relationStatus, setRelationStatus] = useState(props.contact.relation);


  useEffect(() => {
    // console.log('something changed!');
    if (props.socketOpen) {
      props.socket.on('relationChanged', (data) => {

        // console.log('contact id of operation', data.contactId);
        // console.log('contct id of this card', props.contact.id);

        if (data.contactId === props.contact.id) {
          console.log('changing a relation for ', props.contact.id);
            // if (!data.relation) {
            //   data.relation = undefined;
            // }

          setRelationStatus(data.relation);

        }
      });

      return () => {
        // console.log('the clean up function has been run for', props.contact.username);
        // props.socket.off('relationChanged');
      };
    }
  }, [relationStatus, props.contact, props.socket, props.socketOpen]);

  const changeRelation = function () {

    console.log('change relationStatus of:')
    console.log(props.contact.username)

    if (relationStatus === null) {
      console.log('insert a new relation');
      props.socket.emit('addContact', {user: props.user, contactId: props.contact.id});
    }

    if (relationStatus === 'pending') {
      console.log('was pending -> change to accepted');
      props.socket.emit('changeRelation', { user: props.user, contactId: props.contact.id, relation: 'accepted' });
    }

    if (relationStatus === 'accepted') {
      console.log('was accepted -> change to null');
      props.socket.emit('deleteContact', { user: props.user, contactId: props.contact.id, relation: null });
    }

    if (relationStatus === 'requested') {
      props.socket.emit('deleteContact', { user: props.user, contactId: props.contact.id, relation: null })
    }
  }

  const declineRelation = function() {
    if (relationStatus === 'pending') {
      props.socket.emit('deleteContact', { user: props.user, contactId: props.contact.id, relation: null })
    }
  }

  const toDisplayOrNotDisplay = function() {
    if (relationStatus === 'pending') {
      return 'decline-contact-request';
    }

    else {
      return 'decline-contact-request-not-visible';
    }
  }

  return(
      <Card className='contact-card'>
        <PersonOutlineOutlinedIcon className='contact-icon'></PersonOutlineOutlinedIcon>
        <span className='contact-username'>{props.contact.username} </span>
        <span className='contact-email'>{props.contact.email}</span>


        <Button variant="outlined" color="primary" onClick={changeRelation}>
        {relationStatus === undefined ? 'Add Friend'
        : relationStatus === 'accepted' ? 'Remove Friend'
        : relationStatus === 'requested' ? 'Friend Request Sent'
        : relationStatus === 'pending' ? 'Accept Friend Request'
        : 'add contact'}
        </Button>

      <Button className={toDisplayOrNotDisplay()} variant="outlined" color="secondary" onClick={declineRelation} >
        Decline Friend Request
      </Button>


      </Card>
  );
}
