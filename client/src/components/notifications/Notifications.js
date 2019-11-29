import React, { useState } from 'react';

import Notification from './Notification';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';


const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
  }
}));

export default function Notifications(props) {

  const classes = useStyles();
  const [meetingExpanded, setMeetingExpanded] = useState(true);
  const [contactsExpanded, setContactsExpanded] = useState(true);

  const removeNotification = (id) => {
    console.log(id);
    const newNotifications = props.notificationList.filter(notif => notif.id !== id);
    props.setNotificationList(newNotifications);
  }

  const removeAllNotifications = () => {
    console.log('Sending Owen this:', props.user.id);
    props.socket.emit('dismissAllNotifications', { userId: props.user.id });
    props.setNotificationList([]);
  }

  const removeNotificationsByType = (type) => {
    props.socket.emit('dismissNotificationType', { userId: props.user.id, type: type });
    props.setNotificationList(prev => prev.filter(notification => notification.type !== type));
  }


  const meetings = props.notificationList
    .filter(notification => notification.type === "meeting")
    .map(notif => {
      return (<Notification
        key={notif.id}
        id={notif.id}
        meetingId={notif.meetingId}
        user={props.user}
        userId={notif.userId}
        type={notif.type}
        title={notif.title}
        message={notif.msg}
        setInitialExpandedMeeting={props.setInitialExpandedMeeting}
        setMode={props.setMode}
        onRemove={removeNotification}
        timestamp={notif.time}
        setMode={props.setMode}
        socket={props.socket}
        socketOpen={props.socketOpen}
      />);
    });


  const contacts = props.notificationList
    .filter(notification => notification.type === "contact" || notification.type === "dm")
    .map(notif => {
      return (<Notification
        key={notif.id}
        id={notif.id}
        user={props.user}
        userId={props.userId}
        type={notif.type}
        title={notif.title}
        message={notif.msg}
        setMode={props.setMode}
        onRemove={removeNotification}
        timestamp={notif.time}
        setMode={props.setMode}
        socket={props.socket}
        socketOpen={props.socketOpen}
      />);
    });

  return (
    <>
      <div id='page-header'>
        <div className='notifications-header'>
          <Typography variant='h2' color='primary'>Notifications</Typography>
          <Button className={(props.notificationList.length < 1) ? 'dismiss-button-hidden' : null} variant="outlined" color="secondary" size='small' onClick={removeAllNotifications}> Dismiss all</Button>
        </div>
        <Divider />
      </div>
      <div id='notifications-container'>
        {props.notificationList.length === 0 && <p className='app-message'>No new notifications!</p>}

        {meetings.length > 0 &&
          <List
            aria-labelledby="meetings-notifications"
            className={classes.root}
          >
            <ListItem className='section-header' onClick={() => setMeetingExpanded(!meetingExpanded)}>
              <Typography variant='button'>Meeting Notifications</Typography>
              <div>
                <Typography className='clear-notifications' variant='overline' onClick={() => removeNotificationsByType("meeting")}>Dismiss</Typography>
                {meetingExpanded ? <ExpandLess /> : <ExpandMore />}
              </div>
            </ListItem>
            <Collapse in={meetingExpanded} timeout="auto" unmountOnExit>
              <List disablePadding>
                {meetings}
              </List>
            </Collapse>
          </List>
        }

        {contacts.length > 0 &&
          <List
            aria-labelledby="contacts-notifications"
            className={classes.root}
          >
            <ListItem className='section-header' onClick={() => setContactsExpanded(!contactsExpanded)}>
              <Typography variant='button'>Contacts Notifications</Typography>
              <div>
                <Typography className='clear-notifications' variant='overline' onClick={() => removeNotificationsByType("contact")}>Dismiss</Typography>
                {contactsExpanded ? <ExpandLess /> : <ExpandMore />}
              </div>
            </ListItem>
            <Collapse in={contactsExpanded} timeout="auto" unmountOnExit>
              <List disablePadding>
                {contacts}
              </List>
            </Collapse>
          </List>
        }
      </div>
    </>
  );
}
