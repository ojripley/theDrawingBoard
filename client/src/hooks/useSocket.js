import { useState, useEffect } from "react";
import io from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [socketOpen, setSocketOpen] = useState(false);

  // const server = '172.46.3.253:8080'
  const server = 'localhost:8080'

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
