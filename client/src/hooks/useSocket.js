import { useState, useEffect } from "react";
import io from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [socketOpen, setSocketOpen] = useState(false);

  // for local devlopment
  // const server = 'localhost:8080';
  // const server = '172.46.3.253:8080'; //Owen
  // const server = '172.46.3.232:8080'; //TH
  // const server = '172.46.0.146:8080'; //Tammie

  // for deployment
  const server = "https://thedrawingboard-backend.herokuapp.com/";

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

