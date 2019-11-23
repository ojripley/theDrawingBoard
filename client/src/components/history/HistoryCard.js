import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  card: {
    minWidth: 275,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function HistoryCard(props) {

  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h5" component="h2">
          {props.name}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          {props.date}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => {
          console.log('display', props.id)
          return props.displayDetailedHistory(props.id)}}>View More</Button>
      </CardActions>
    </Card>
  );
}
