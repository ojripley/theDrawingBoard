# The Drawing Board
A collaborative meeting app that allows users to schedule and host meetings remotely, whiteboard over documents in real-time, and take personal notes. Audio streaming and text chats are enabled in the meeting room for communication. Marked up documents and notes are saved to users' dashboards for future reference. 

## Project Setup
A hosted version of this project is available at [theDrawingBoard.site](https://www.thedrawingboard.site/). The steps below outline the steps to create a local development version of the application.

### Client

Run `npm install` to install dependencies, and then run `npm start` to tun the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Server
Run `npm install` to install dependencies. If you would like to have PDF support for the server, you must also install ImageMagick, Ghostscript, and poopler. The commands to do so are:
On OSX:
`sudo apt-get install imagemagick ghostscript poppler-utils`
On Ubunutu 
`brew install imagemagick ghostscript poppler`

Finally the server may be run using the command `npm run local` (runs on port 8080 by default).

## Features

![contacts](/doc/contacts.png)
![meeting notes](/doc/meeting_notes.png)
![start meeting](/doc/start_meeting.png)
![meetings](/doc/meetings.png)

## Dependencies

## Built with
- React
- Node
- Express
- Socket.io
- PostgreSQL
- WebRTC
- HTML
- Canvas

# Features to be added

# Contributors
@tammiec, @ojripley, @ThilakshanArulnesan
