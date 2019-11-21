import React from 'react';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  }
}));

export default function Owner(props) {

  const classes = useStyles();

  const onDestroy = () => {
    console.log('destroy')
  };

  const onEdit = () => {
    console.log('edit')
  };

  return (
    <div>
      <Button variant="contained" color="secondary" className={classes.button}>
        Start Meeting
      </Button>
      <EditIcon onClick={onEdit}/>
      <DeleteIcon onClick={onDestroy}/>
    </div>
  );
}
