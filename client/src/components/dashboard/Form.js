import React, { useState, useEffect } from 'react';

import FileUpload from './FileUpload';

// Material UI - Text Inputs
import Box from '@material-ui/core/Box';
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
  file: {
    marginTop: '1em',
    width: 200,
    padding: '2em',
    border: 'solid 1px gray'
  }
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

function getStyles(name, selectedContacts, theme) {
  return {
    fontWeight:
      selectedContacts.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
};

export default function Form(props) {
  const classes = useStyles();
  const theme = useTheme();

  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.emit('fetchContactsByUserId', { id: props.user.id });
      props.socket.on('contactsByUserId', data => {
        console.log(data)
        setContacts(data);
      })
      return () => {
        props.socket.off('contactsByUserId');
      };
    }
  }, [props.socketOpen, props.socket, props.user.id])

  const handleContactChange = event => {
    console.log('selected contacts', event.target.value)
    props.setSelectedContacts(event.target.value);
  };

  const handleDateChange = date => {
    props.setSelectedDate(date);
  };

  const handleMeetingNameChange = event => {
    props.setMeetingName(event.target.value);
  }

  const handleMeetingDescChange = event => {
    props.setMeetingDesc(event.target.value);
  }

  const handleFileUpload = event => {
    props.setFile({ name: event.target.files[0].name, payload: event.target.files[0] });
  }

  const contactsList = contacts.map(contact => {

    if (contact.relation === 'accepted') {
      return (
        <MenuItem key={contact.id} value={contact} style={getStyles(contact.username, props.selectedContacts, theme)}>
          {contact.username}
        </MenuItem>
      )
    } else {
      return null;
    }
  });

  return (
    <Box className={classes.container} noValidate autoComplete="off">
      <div>
        <TextField
          label="Name"
          placeholder='Meeting Name'
          className={classes.textField}
          margin="normal"
          onChange={handleMeetingNameChange}
        />
        <TextField
          label="Description"
          placeholder='Meeting Description'
          className={classes.textField}
          margin="normal"
          onChange={handleMeetingDescChange}
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
              value={props.selectedDate}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
            <KeyboardTimePicker
              margin="normal"
              id="time-picker"
              label="Time"
              value={props.selectedDate}
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
            value={props.selectedContacts}
            onChange={handleContactChange}
            input={<Input id="select-multiple-chip" />}
            renderValue={selected => (
              <div className={classes.chips}>
                {selected.map(value => (
                  <Chip key={value.id} label={value.username} className={classes.chip} />
                ))}
              </div>
            )}
            MenuProps={MenuProps}
          >
            {contactsList}
          </Select>
          <input className={classes.file} type='file' onChange={handleFileUpload} accept=".pdf,.jpeg, .png,.gif,.svg,.tiff,.ai,.jpg"/>
        </FormControl>
      </div>
    </Box>
  );
}
