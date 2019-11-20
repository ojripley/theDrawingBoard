import { useState, useEffect } from "react";
import io from 'socket.io-client';

export const useSocket = (server = "localhost:8080") => {
  const [socket, setSocket] = useState(null);
  const [socketOpen, setSocketOpen] = useState(false);

  useEffect(() => {
    setSocket(io(server));
  }, [server]);

  useEffect(() => {
    if (socket) {
      setSocketOpen(true);
    }
  }, [socket]);



  return {
    socket,
    socketOpen
  };
};
