import React, { useState } from 'react';

import Notification from './Notification';
import { makeStyles } from '@material-ui/core/styles';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles(theme => ({
  list: {
    width: '100%'
  },
  section: {
    margin: theme.spacing(1)
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  active: {
    backgroundColor: 'orange'
  },
  scheduled: {
    backgroundColor: 'white'
  },
  button: {
    display: 'inline',
    float: 'right',
    margin: theme.spacing(1),
  },
  header2: {
    fontSize: '1.5em',
    fontWeight: 'bold'

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

  const removeMeetingNotifications = (type) => {
    props.socket.emit('dismissNotificationType', { userId: props.user.id, type: type });
    props.setNotificationList([]);
  }


  const meetings = props.notificationList
    .filter(notification => notification.type === "meeting")
    .map(notif => {
      return (<Notification
        key={notif.id}
        id={notif.id}
        user={props.user}
        userId={notif.userId}
        type={notif.type}
        title={notif.title}
        message={notif.msg}
        onClick={() => {
          props.setInitialExpandedMeeting(`panel${notif.meetingId}`);
          props.setMode("DASHBOARD");
        }}
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
        onClick={() => props.setMode("CONTACTS")}
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
        <Typography variant='h2' color='primary'>Notifications</Typography>
        <Divider />
      </div>
      <Button variant="outlined" color="secondary" onClick={removeAllNotifications}> Dismiss all</Button>

      {props.notificationList.length === 0 && <h2> No new notifications</h2>}

      {meetings.length > 0 &&
        <ExpansionPanel expanded={meetingExpanded} onChange={() => setMeetingExpanded(!meetingExpanded)}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel1bh-content`}
            id={`panel1bh-header`}
          >
            <span className={classes.header2}> {`Meeting Notifications (${meetings.length})`}</span>
            <Button variant="outlined" color="secondary" onClick={() => removeMeetingNotifications("meeting")}> Dismiss meeting notifications</Button>

          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <ul className={classes.list}>
              {meetings}
            </ul>
          </ExpansionPanelDetails>
        </ExpansionPanel>

      }

      {contacts.length > 0 &&
        <ExpansionPanel expanded={contactsExpanded} onChange={() => setContactsExpanded(!contactsExpanded)}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel1bh-content`}
            id={`panel1bh-header`}
          >
            <h2 className={classes.section}> {`Contact Notifications (${contacts.length})`}</h2>
            <Button variant="outlined" color="secondary" onClick={() => removeMeetingNotifications("contact")}> Dismiss contact notifications</Button>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <ul className={classes.list}>
              {contacts}
            </ul>
          </ExpansionPanelDetails>
        </ExpansionPanel>

      }
    </>
  );
}
