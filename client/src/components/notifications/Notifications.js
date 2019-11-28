import React, { useState } from 'react';

import Notification from './Notification';
import { makeStyles, withStyles } from '@material-ui/core/styles';

import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
// import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';


const useStyles = makeStyles(theme => ({
  // list: {
  //   width: '100%'
  // },
  // section: {
  //   margin: theme.spacing(1)
  // },
  // heading: {
  //   fontSize: theme.typography.pxToRem(15),
  //   flexBasis: '33.33%',
  //   flexShrink: 0,
  // },
  // secondaryHeading: {
  //   fontSize: theme.typography.pxToRem(15),
  //   color: theme.palette.text.secondary,
  // },
  // active: {
  //   backgroundColor: 'orange'
  // },
  // scheduled: {
  //   backgroundColor: 'white'
  // },
  // button: {
  //   display: 'inline',
  //   float: 'right',
  //   margin: theme.spacing(1),
  // },
  // header2: {
  //   fontSize: '1.5em',
  //   fontWeight: 'bold'
  // }
  // panel: {
  //   margin: 0,
  //   '&expanded' : {
  //     margin: 0
  //   }
  // }
}));

const ExpansionPanelSummary = withStyles({
  root: {
    height: 'auto',
    verticalAlign: 'center',
    padding: '1em',
    height: '54px'
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: 0,
    '&$expanded': {
      margin: 0,
      height: '54px'
    },
  },
  expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanel = withStyles({
  root: {
    '&$expanded': {
      margin: 0,
      padding: 0
    }
  },
  content: {},
  expanded: {},
})(MuiExpansionPanel);

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
      <Button variant="outlined" color="secondary" size='small' onClick={removeAllNotifications}> Dismiss all</Button>

      {props.notificationList.length === 0 && <Typography variant='h6'> No new notifications</Typography>}

      {meetings.length > 0 &&
        <ExpansionPanel expanded={meetingExpanded} onChange={() => setMeetingExpanded(!meetingExpanded)} classes={{ root: classes.panel }} >
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel1bh-content`}
            id={`panel1bh-header`}
          >
            <Typography variant='button'>{`Meeting Notifications (${meetings.length})`}</Typography>
            <Button variant="outlined" color="secondary" size='small' onClick={() => removeMeetingNotifications("meeting")}> Dismiss meeting notifications</Button>

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
            <Typography variant='button'>{`Contact Notifications (${contacts.length})`}</Typography>
            <Button variant="outlined" color="secondary" onClick={() => removeMeetingNotifications("contact")}>Dismiss contact notifications</Button>
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
