import React, { useState } from 'react';

export default function Message(props) {

  return (
    <>
      <p>{props.msg}</p>
      <span><p>{props.user.username}</p><p>{props.time}</p></span>
    </>
  );
}
