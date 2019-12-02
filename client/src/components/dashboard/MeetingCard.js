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
  setUsersInMeeting
}) {

  const classes = useStyles();

  const [activeMeeting, setActiveMeeting] = useState(active);
  // let [loadingCounter,] = useState(0);
  let loadingCounter = 0;
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

  const date = new Date(startTime);

  useEffect(() => {
    if (socketOpen) {

      socket.on(`enteredMeeting${id}`, data => {

        console.log('okay im going in');
        let res = data.meeting;
        console.log("Setting ownerid");
        setOwnerId(res.owner_id);
        console.log("Setting meetingid");
        setMeetingId(res.id);
        console.log("Setting notes");
        setMeetingNotes(data.notes);
        console.log('setting live users', res.liveUsers);

        for (let liveUser in res.liveUsers) {
          console.log('the user:', liveUser);

          const liveUserId = 'theDrawingBoard' + res.liveUsers[liveUser].id;

          setUsersInMeeting(prev => ({
            ...prev,
            [liveUserId]: res.liveUsers[liveUser]
          }));
        }

        // console.log('the users already in the meeting are:', usersInMeeting);

        // setUsersInMeeting(tempLiveUsers);

        setPixelColor(res['colorMapping']);
        if (data.images) {//if image
          console.log("there is an image");
          setBackgroundImage(Array(data.images.length)); //initialize array of proper length to access later
          console.log('data.pixels:', data.pixels);
          setInitialPixels(data.pixels);//assuming server is sending us array of pixel
          for (let i in data.images) {
            let myImage = new Image();
            myImage.onload = () => {
              console.log(data.images);
              console.log(`Updating background image ${i}`);
              setBackgroundImage(prev => {
                loadingCounter++;
                prev[i] = myImage; //sets the image in the proper index (maintaining order)
                if (loadingCounter === data.images.length) {
                  console.log(`Setting Loading to true`);
                  setLoading(false);
                  console.log(`Setting imageLoaded to true`);
                  setImageLoaded(true);
                  console.log(`Setting inMeeting to true`);
                  setInMeeting(true);
                }
                return prev;
              });

              console.log("received these pixels", data.pixels)
            };
            myImage.src = data.images[i];
          }
        }

      })
    }
    return () => {
      socket.off(`enteredMeeting${id}`);
    };

  }, [socket, socketOpen, setInMeeting, setMeetingId, setOwnerId, setBackgroundImage, setImageLoaded, setInitialPixels, setMeetingNotes]);

  useEffect(() => {
    console.log('id of meeting', id);
    if (id) {
      socket.on(`meetingStarted${id}`, res => {
        if (id === res.meetingId) {
          setActiveMeeting(true);
          console.log('meeting started');
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
          {activeMeeting && <Button variant="contained" color="primary" className={classes.enterButton} onClick={enterMeeting}>
            Enter Meeting
          </Button>}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}
