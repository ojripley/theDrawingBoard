import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

export default function HistoryCard(props) {

  const date = new Date(props.date).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });

  return (
    <Card className='history-list-item'>
      <CardContent>
        <Typography variant="h6">{props.name}</Typography>
        <Typography variant='overline'>{date}</Typography>
        <Button className='view-more' size="small" onClick={() => props.displayDetailedHistory(props.id)}>View More</Button>
      </CardContent>
    </Card>
  );
}
