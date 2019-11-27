import React, { useEffect, useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';

import Owner from './Owner';
import Attendee from './Attendee';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%'
  },
  active: {
    backgroundColor: theme.palette.tertiary.main
  },
  scheduled: {
    backgroundColor: 'white'
  },
  button: {
    margin: 0
  },
  meetingSummary: {
    height: 'auto',
    verticalAlign: 'center',
    padding: '1em',
  },
  meetingSummaryContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: 0,
  },
  date: {
    flexBasis: '75%'
  },
  time: {
    flexBasis: '25%',
    alignSelf: 'center'
  },
  name: {
    flexBasis: '100%',
    minWidth: '0',
  },
  description: {
    overflowWrap: 'break-word',
    hyphens: 'auto',
    flexGrow: 1
  },
  meetingExpanded: {
    height: 'auto',
    verticalAlign: 'center',
    padding: '1em',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: 0,
  },
  attendees: {
    flexBasis: '33.33%'
  }
}));

const ExpansionPanelSummary = withStyles({
  content: {
    '&$expanded': {
      margin: '0px 0',
    },
  },
  expanded: {},
})(MuiExpansionPanelSummary);

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
  setMeetingId,
  setOwnerId,
  setBackgroundImage,
  setImageLoaded,
  setInitialPixels,
  setMeetingNotes,
}) {

  const classes = useStyles();

  const [activeMeeting, setActiveMeeting] = useState(active);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const startMeeting = () => {
    socket.emit('startMeeting', { id: id });
  };

  const enterMeeting = () => {
    socket.emit('enterMeeting', { user: user, meetingId: id, attendeeIds: attendeeIds })
  }

  const date = new Date(startTime);

  useEffect(() => {
    if (socketOpen) {

      socket.on('enteredMeeting', data => {
        // console.log('Meeting is: ', res);
        let res = data.meeting;
        setOwnerId(res.owner_id);
        setMeetingId(res.id);
        console.log(data.notes);
        setMeetingNotes(data.notes);
        setInMeeting(true);

        if (data.image) {//if image
          let myImage = new Image();
          myImage.onload = () => {
            setImageLoaded(true);
            setBackgroundImage(myImage);
            console.log("received these pixels", data.pixels)
            setInitialPixels(data.pixels);
          };
          myImage.src = data.image; //pull this from socket
        } else {//if no image
          let myImage = new Image();
          myImage.onload = () => {
            setImageLoaded(true);
            setBackgroundImage(myImage);
            console.log("received these pixels", data.pixels)
            setInitialPixels(data.pixels);
          };
        }

      })

      return () => {
        socket.off('enteredMeeting');
      };
    }
  }, [socket, socketOpen, setInMeeting, setMeetingId, setOwnerId, setBackgroundImage, setImageLoaded, setInitialPixels, setMeetingNotes]);

  useEffect(() => {
    socket.on('meetingStarted', res => {
      // console.log('res', res)
      if (id === res.meetingId) {
        setActiveMeeting(true);
      }
    })

    return () => {
      socket.off('meetingStarted');
    };
  }, [socket, id, activeMeeting])

  const attendances = [];
  const attendeeNames = attendees.map((attendee) => {
    let attendance = attendee.attendance === 'invited' ? 'invited' : 'accepted';
    attendances.push(<li className={`${attendance} attendees`} key={`attendance-${attendee.id}`}> {attendee.attendance}</li>)
    return <li className='attendees' key={`name-${attendee.id}`}>
        {attendee.username}
      </li>
  })

  return (
    <div className={classes.root}>
      <ExpansionPanel className={activeMeeting ? classes.active : classes.scheduled} expanded={expanded === `panel${id}`} onChange={handleChange(`panel${id}`)}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel${id}bh-content`}
          id={`panel${id}bh-header`}
          classes={{
            root: classes.meetingSummary,
            content: classes.meetingSummaryContent
          }}
        >
          <Typography classes={{ root: classes.date }} variant='h6'>{date.toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Typography>
          <Typography classes={{ root: classes.time }} align='right' variant='subtitle2'>{date.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric'
            })}
          </Typography>
          <Typography classes={{ root: classes.name }} variant='overline'>{name}</Typography>
          <Typography variant="subtitle2">Host: {owner}</Typography>
          {!expanded && <Typography variant="subtitle2">{attendees.length} Attendees</Typography>}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails classes={{ root: classes.meetingExpanded }}>
          <Typography classes={{ root: classes.name }} variant="subtitle2">
            Description:
            <Typography classes={{ root: classes.description }} variant="body2">{description}</Typography>
          </Typography>
          <Typography className={'attendees'} variant="subtitle2">Attendees ({attendees.length})</Typography>
          <ul>
            {attendeeNames}
          </ul>
          <ul>
            {attendances}
          </ul>
          {user.username === owner ?
            <Owner
              id={id}
              socket={socket}
              startMeeting={startMeeting}
              activeMeeting={activeMeeting}
              attendeeIds={attendeeIds}
            />
            : <Attendee
              user={user}
              meetingId={id}
              socket={socket}
              socketOpen={socketOpen}
              attendance={user.attendance}
            />
          }
          {activeMeeting && <Button variant="contained" color="primary" className={classes.button} onClick={enterMeeting}>
            Enter Meeting
          </Button>}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}
