import React, { useState, useEffect } from 'react';

// Material UI - Text Inputs
import TextField from '@material-ui/core/TextField';
import { makeStyles, useTheme } from '@material-ui/core/styles';

// Material UI - Date & Time Pickers
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

// Material UI - Name Selector
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  button: {
    margin: theme.spacing(1),
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, contactName, theme) {
  return {
    fontWeight:
      contactName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

// const names = [
//   'Oliver Hansen',
//   'Van Henry',
//   'April Tucker',
//   'Ralph Hubbard',
//   'Omar Alexander',
//   'Carlos Abbott',
//   'Miriam Wagner',
//   'Bradley Wilkerson',
//   'Virginia Andrews',
//   'Kelly Snyder',
// ];


export default function Form(props) {
  const classes = useStyles();
  const theme = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [contactName, setContactName] = useState([]);
  const [contacts, setContacts] = useState([]);

  const handleChange = event => {
    setContactName(event.target.value);
  };

  const handleDateChange = date => {
    setSelectedDate(date);
  };

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.emit('fetchContacts', {id: props.user});
      props.socket.on('contacts', data => {
        setContacts(data);
      })
      return () => props.socket.off('contacts');
    }
  }, [props.socket, props.socketOpen, props.user]);

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
              label="date"
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
      <div>
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-mutiple-chip-label">Contacts</InputLabel>
          <Select
            labelId="demo-mutiple-chip-label"
            id="demo-mutiple-chip"
            multiple
            value={contactName}
            onChange={handleChange}
            input={<Input id="select-multiple-chip" />}
            renderValue={selected => (
              <div className={classes.chips}>
                {selected.map(value => (
                  <Chip key={value} label={value} className={classes.chip} />
                ))}
              </div>
            )}
            MenuProps={MenuProps}
          >
            {contacts.map(contact => (
              <MenuItem key={contact.id} value={contact.username} style={getStyles(contact.username, contactName, theme)}>
                {contact.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </form>
  );
}
