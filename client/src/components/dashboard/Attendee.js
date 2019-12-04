import React, { useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles(theme => ({
  formControl: {
    minWidth: 120,
    margin: 0
  }
}));

export default function Attendee(props) {
  const classes = useStyles();
  const [rsvp, setRsvp] = React.useState(props.attendance);

  const handleChange = event => {

    let attendance = '';
    if (event.target.value === 'accepted') {
      attendance = 'accepted';
    }

    if (event.target.value === 'declined') {
      attendance = 'declined';
    }

    setRsvp(attendance);

    props.socket.emit('changeAttendance', { user: props.user, meetingId: props.meetingId, rsvp: attendance });
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="demo-simple-select-helper-label">RSVP</InputLabel>
      <Select
        labelId="demo-simple-select-helper-label"
        id="demo-simple-select-helper"
        value={rsvp}
        onChange={handleChange}
      >
        <MenuItem className='invited-placeholder' value='invited'></MenuItem>
        <MenuItem value='accepted'>Accepted</MenuItem>
        <MenuItem value='declined'>Declined</MenuItem>
      </Select>
      <FormHelperText>Please respond</FormHelperText>
    </FormControl>
  );
}
