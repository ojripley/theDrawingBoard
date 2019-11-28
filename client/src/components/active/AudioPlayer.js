import React, {ReactDOM, useRef} from 'react';


export default function AudioPlayer(props) {

  // const audioRef = useRef(null);

  console.log('i am the audio player, receiving', props.stream);

  // const tracks = props.stream.getAudioTracks();
  // const audio = tracks[0];

  // console.log('the audio track', audio);

  const body = document.querySelector('body');

  const audioStream = document.createElement('audio');
  audioStream.setAttribute('id', 'stream');
  audioStream.setAttribute('autoPlay', true);
  body.prepend(audioStream);
  audioStream.srcObject = props.stream;

  return (

    <>
      {/* <audio>
        <source src={props.stream} type='audio/ogg'></source>
        <source src={props.stream} type='audio/mpeg'></source>
      </audio> */}
{/*
      <audio autoPlay>
      </audio> */}
    </>
  )
}
