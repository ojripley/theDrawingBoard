import React, { useState, useEffect } from 'react';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Button from '@material-ui/core/Button';
// import cookie from "react-cookie";

export default function Login(props) {

  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (props.socketOpen) {
      console.log('attempting to log in')
      console.log(email, password)
      props.socket.emit('loginAttempt', { email: email, password: password });
    }
  };

  const onEnter = event => {
    if (event.charCode === 13) {
      handleLogin();
    }
  }

  useEffect(() => {
    if (props.socketOpen) {
      props.socket.on('loginResponse', (data) => {
        if (data.user && data.user.id) {
          console.log(data);
          console.log("Attempting to set cookie");
          document.cookie = `sid=${data.session}`;
          console.log(document.cookie);
          props.setUser(data.user);
        }
      })

      return () => props.socket.off('loginResponse')
    }
  });

  return (
    <FormControl>
      <h2>Login</h2>
      <TextField
        id="email"
        label="Email"
        color="secondary"
        value={email}
        onChange={event => setEmail(event.target.value)}
      />
      <TextField
        id="password"
        label="Password"
        color="secondary"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={event => setPassword(event.target.value)}
        onKeyPress={onEnter}
        InputProps={{
          endAdornment:
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => showPassword ? setShowPassword(false) : setShowPassword(true)}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
        }}
      />
      <Button variant="contained" onClick={handleLogin}>Login</Button>
    </FormControl>
  );
}
