import React from 'react';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

export default function Owner(props) {

  const onDestroy = () => {
    console.log('destroy')
  };

  const onEdit = () => {
    console.log('edit')
  };

  return (
    <div>
      <EditIcon onClick={onEdit}/>
      <DeleteIcon onClick={onDestroy}/>
    </div>
  );
}
