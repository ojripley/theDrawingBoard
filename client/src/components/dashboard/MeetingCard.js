import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';

import Owner from './Owner';
import Attendee from './Attendee';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
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
    margin: theme.spacing(1),
  }
}));

export default function MeetingCard({
  id,
  startTime,
  name,
  owner,
  attendees,
  attendeeIds,
  description,
  active,
  user,
  expanded,
  setExpanded,
  socket,
  socketOpen,
  setInMeeting,
  setMeetingId
}) {

  const classes = useStyles();

  const [activeMeeting, setActiveMeeting] = useState(active);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const startMeeting = () => {
    socket.emit('startMeeting', {id: id});
  };

  const enterMeeting = () => {
    socket.emit('enterMeeting', {user: user, meetingId: id, attendeeIds: attendeeIds})
  }

  useEffect(() => {
    if (socketOpen) {
      // socket.on('meetingStarted', res => {
      //   console.log(res)
      //   if (id === res) {
      //     setActiveMeeting(true);
      //     setMeetingId(id);
      //   }
      // })

      socket.on('enteredMeeting', res => {
        console.log('Meeting is: ', res);
        setInMeeting(true)
      })

      return () => {
        // console.log('closing listeners')
        // socket.off('meetingStarted');
        socket.off('enteredMeeting');
      };
    }
  }, [socket, socketOpen, setInMeeting]);

  useEffect(() => {
    socket.on('meetingStarted', res => {
      console.log('res', res)
      if (id === res) {
        setActiveMeeting(true);
        setMeetingId(id);
      }
    })

    return () => {
      socket.off('meetingStarted');
    };
  }, [socket, id, activeMeeting, setMeetingId])

  return (
    <div className={classes.root}>
      <ExpansionPanel className={activeMeeting ? classes.active : classes.scheduled} expanded={expanded === `panel${id}`} onChange={handleChange(`panel${id}`)}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel${id}bh-content`}
          id={`panel${id}bh-header`}
        >
          <Typography className={classes.heading}>{startTime}</Typography>
          <Typography className={classes.secondaryHeading}>{name}</Typography>
          <Typography variant="body2" component="p">{owner}</Typography>
          <Typography variant="body2" component="p">{attendees.length} Attendees</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Typography variant="body2" component="p">
            Description: {description}
          </Typography>
          <Typography variant="body2" component="p">Attendees</Typography>
            <ul>
              {attendees.map((attendee, index) => (<li key={index}>{attendee}</li>))}
            </ul>
          {user.username === owner ?
            <Owner
              id={id}
              socket={socket}
              startMeeting={startMeeting}
              activeMeeting={activeMeeting}
            />
            : <Attendee />
          }
          {activeMeeting && <Button variant="contained" color="primary" className={classes.button} onClick={enterMeeting}>
            Enter Meeting
          </Button>}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}
