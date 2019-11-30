import {useState} from 'react';
import Peer from 'peerjs';

export const usePeer = () => {

  const [peer, setPeer] = useState(null);

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
    peer,
    setPeer,
  };
}
