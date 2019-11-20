import React from 'react';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    border: 'solid 1px black'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
}));

export default function Form() {
  const classes = useStyles();

  const [selectedDate, setSelectedDate] = React.useState(new Date);

  const handleDateChange = date => {
    setSelectedDate(date);
  };

  return (
    <form className={classes.container} noValidate autoComplete="off">
      <div>
        <TextField
          label="Name"
          defaultValue="Meeting Name"
          className={classes.textField}
          margin="normal"
        />
        <TextField
          label="Description"
          defaultValue="Agenda"
          className={classes.textField}
          margin="normal"
        />
      </div>
      <div>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Grid container justify="space-around">
            <KeyboardDatePicker
              margin="normal"
              id="date-picker-dialog"
              label="Date"
              format="MM/dd/yyyy"
              value={selectedDate}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
            <KeyboardTimePicker
              margin="normal"
              id="time-picker"
              label="Time"
              value={selectedDate}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change time',
              }}
            />
          </Grid>
        </MuiPickersUtilsProvider>
      </div>
    </form>
  );
}
