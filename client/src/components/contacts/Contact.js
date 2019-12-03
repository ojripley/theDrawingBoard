import React, { useEffect, useState } from 'react';

import Card from '@material-ui/core/Card';
import PersonIcon from '@material-ui/icons/Person';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';


import './Contacts.scss';


export default function Contact(props) {

  const [relationStatus, setRelationStatus] = useState(props.contact.relation);

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.on('relationChanged', (data) => {

        if (data.contactId === props.contact.id) {
          console.log('changing a relation for ', props.contact.id);
          setRelationStatus(data.relation);

        }
      });

      // return () => {
      //   // console.log('the clean up function has been run for', props.contact.username);
      //   // props.socket.off('relationChanged');
      // };
    }
  }, [relationStatus, props.contact, props.socket, props.socketOpen]);

  const changeRelation = function() {

    console.log('change relationStatus of:')
    console.log(props.contact.username)

    if (relationStatus === null) {
      console.log('insert a new relation');
      props.socket.emit('addContact', { user: props.user, contactId: props.contact.id });
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
    console.log(relationStatus)
    if (relationStatus === 'pending') {
      console.log('inside the if', relationStatus);
      return 'decline-contact-request';
    } else {
      console.log('inside the else', relationStatus);
      return 'decline-contact-request-not-visible';
    }
  };

  return (
    <Card classes={{ root: 'contact-card' }}>
      <div className='contact-info'>
        <PersonIcon className='contact-icon' />
        <Typography className='contact-username' variant='h6'>{props.contact.username} </Typography>
        <Typography className='contact-email' variant='body2'>{props.contact.email}</Typography>
      </div>

      <div className='contact-buttons'>
        <Button variant="outlined" color="primary" size='small' onClick={changeRelation}>
          {relationStatus === undefined ? 'Add'
            : relationStatus === 'accepted' ? 'Remove'
              : relationStatus === 'requested' ? 'Request Sent'
                : relationStatus === 'pending' ? 'Accept Request'
                  : 'add contact'}
        </Button>

        <Button className={toDisplayOrNotDisplay()} variant="outlined" color="secondary" size='small' onClick={declineRelation} >
          Decline Request
        </Button>
        {relationStatus === 'accepted' && <Button className="dm-button" variant="outlined" color="secondary" size='small' onClick={() => props.displayChat(props.contact.id)} >
          DM
        </Button>}
      </div>

    </Card>
  );
}
