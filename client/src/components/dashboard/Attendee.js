import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  }
}));

export default function Attendee() {
  const classes = useStyles();
  const [rsvp, setRsvp] = React.useState('');

  const handleChange = event => {
    setRsvp(event.target.value);
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
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value='accept'>Accept</MenuItem>
        <MenuItem value='maybe'>Maybe</MenuItem>
        <MenuItem value='decline'>Decline</MenuItem>
      </Select>
      <FormHelperText>Please respond</FormHelperText>
    </FormControl>
  );
}
