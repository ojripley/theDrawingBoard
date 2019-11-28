import { useState, uesEffect } from 'react';
import Peer from 'peerjs';

export const useConnections = () => {

  const [calls, setCalls] = useState({});

  // on('connection', (peerID) => {
  //   let peer = peers[peerId]
  //   if (!peer) {
  //     peer = new Peer(peerId)
  //   }
  //   peer.connect(userId)
  // });

  // useEffect(() => {


  // }, [peers])

  return {
    calls,
    setCalls
  };
}
