import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  card: {
    minWidth: 275,
    border: 'solid 1px black'
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  details: {
    color: 'blue'
  }
});

export default function CollapsedView(props) {
  const classes = useStyles();

  return (
    <Card className={classes.card} onClick={props.onClick}>
      <CardContent>
        <Typography variant="h5" component="h2">{props.startTime}</Typography>
        <Typography className={classes.pos} color="textSecondary">{props.name}</Typography>
        <Typography className={classes.details}>{props.notes}</Typography>
        <Typography variant="body2" component="p">{props.owner}</Typography>
        <Typography variant="body2" component="p">Attendees</Typography>
        <ul>
          {props.attendees.map(attendee => (<li>{attendee}</li>))}
        </ul>
      </CardContent>
    </Card>
  );
}
