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
    width: '100%',
    maxWidth: '94vw'
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
  enterButton: {
    margin: '1em 0 0'
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
  },
  meetingExpanded: {
    height: 'auto',
    verticalAlign: 'center',
    padding: '1em',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    margin: 0,
  },
}));

const ExpansionPanelSummary = withStyles({
  root: {},
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
  setLoading,
  setPixelColor,
  setUsersInMeeting,
  setInitialPage,
}) {

  const classes = useStyles();

  const [activeMeeting, setActiveMeeting] = useState(active);
  const [loadingCounter, setLoadingCounter] = useState(0);

  const date = new Date(startTime);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const startMeeting = () => {
    socket.emit('startMeeting', { id: id });
  };

  const enterMeeting = () => {
    socket.emit('enterMeeting', { user: user, meetingId: id, attendeeIds: attendeeIds })
    setLoading(true);
  }

  useEffect(() => {
    if (socketOpen) {

      socket.on(`enteredMeeting${id}`, data => {

        let res = data.meeting;
        setOwnerId(res.owner_id);
        setMeetingId(res.id);
        setMeetingNotes(data.notes);
        setInitialPage(res.initialPage);

        for (let liveUser in res.liveUsers) {

          const liveUserId = 'theDrawingBoard' + res.liveUsers[liveUser].id;

          setUsersInMeeting(prev => ({
            ...prev,
            [liveUserId]: res.liveUsers[liveUser]
          }));
        };

        setPixelColor(res['colorMapping']);
        if (data.images) { //if image

          setBackgroundImage(Array(data.images.length)); //initialize array of proper length to access later
          setInitialPixels(data.pixels); //assuming server is sending us array of pixel

          for (let i in data.images) {

            let myImage = new Image();

            myImage.onload = () => {

              setBackgroundImage(prev => {
                prev[i] = myImage; //sets the image in the proper index (maintaining order)

                setLoadingCounter(previousCount => {
                  if (++previousCount === data.images.length) {
                    setLoading(false);
                    setImageLoaded(true);
                    setInMeeting(true);
                    // setTimeout(() => {
                      socket.emit('everythingLoaded');
                    // }, 3000);
                  }
                  return previousCount;
                })

                return prev;
              });

            };
            myImage.src = data.images[i];
          }
        }
      })
    }
    return () => {
      socket.off(`enteredMeeting${id}`);
    };

  }, [socket, socketOpen, setInMeeting, setMeetingId, setOwnerId, setBackgroundImage, setImageLoaded, setInitialPixels, setMeetingNotes, id, setUsersInMeeting, setInitialPage, setLoading, loadingCounter, setPixelColor]);

  useEffect(() => {
    if (id) {
      socket.on(`meetingStarted${id}`, res => {
        if (id === res.meetingId) {
          setActiveMeeting(true);
        }
      });
    }

    return () => {
      if (id) {
        socket.off(`meetingStarted${id}`);
      }
    };
  }, [socket, id, activeMeeting]);

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
        </ExpansionPanelSummary>
        <ExpansionPanelDetails classes={{ root: classes.meetingExpanded }}>
          <Typography classes={{ root: classes.name }} variant="subtitle2">
            Description:
            <Typography classes={{ root: classes.description }} variant="body2">{description}</Typography>
          </Typography>
          <div className='attendees-container'>
            <Typography className='attendees' variant="subtitle2">Attendees ({attendees.length})</Typography>
            <ul>
              {attendeeNames}
            </ul>
            <ul>
              {attendances}
            </ul>
          </div>
          {user.username !== owner &&
            <Attendee
              user={user}
              meetingId={id}
              socket={socket}
              socketOpen={socketOpen}
              attendance={user.attendance}
            />}
          <div id='owner-controls'>
            {user.username === owner &&
              <Owner
                id={id}
                socket={socket}
                startMeeting={startMeeting}
                activeMeeting={activeMeeting}
                attendeeIds={attendeeIds}
              />}
            {activeMeeting && <Button variant="contained" size='small' color="primary" className={classes.enterButton} onClick={enterMeeting}>
              Enter Meeting
          </Button>}
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}
