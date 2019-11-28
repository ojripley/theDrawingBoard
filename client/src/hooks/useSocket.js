import { useState, useEffect } from "react";
import io from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [socketOpen, setSocketOpen] = useState(false);

<<<<<<< HEAD
  const server = '172.46.3.253:8080'; //Owen
=======

  // for local devlopment
  // const server = 'localhost:8080';
  // const server = '172.46.3.253:8080'; //Owen
>>>>>>> 7a915a8aa88a1d72bb94e381602a393c86718c62
  // const server = '172.46.3.232:8080'; //TH
  // const server = '172.46.0.146:8080'; //Tammie

  // for deployment
  const server = process.env.REACT_APP_WEBSOCKET_URL;

  useEffect(() => {
    const s = io(server);

    setSocket(s);
    setSocketOpen(true);

    return () => {
      s.close(server);
    }
  }, [server]);

  return {
    socket,
    socketOpen
  };
};
