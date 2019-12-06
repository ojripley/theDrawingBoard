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

![login and registration page](/doc/login_registration.png)
- Users are able to register and login with an e-mail, username, and password.

![contacts page](/doc/contacts.png)
- Search global users (by username or e-mail) to add contacts or remove contacts

![two users direct messaging each other](/doc/dm.png)
- Users are able to send messages to each other
- Messages persist between sessions.

![a toast notification displaying that a contact has added the user](/doc/toast.png)
- Notifications are displayed to the relevant user whenever the following actions occur:
  - New contact is added/requested
  - A dm is sent
  - A meeting is started (sent to all invitees)
  - 5 minutes before a meeting is scheduled to start (sent to the owner)
  - A meeting concluded (sent to invitees who were not able to participate in the meeting)

![notifications tab display notifications divided into contacts and meetings](/doc/notifications.png)
- Notifications persist in the database and are stored in the notifications tab until a user dismisses them
- Notifications are categorized and are optionally disimissable individually, by category, or all.

![meetings](/doc/meetings.png)
- The dashboard will show the user with all their scheduled meetings

![start meeting](/doc/create_meeting.png)
- A meeting can be created with a title, description, date/time, list of invitees, and a set of images (supports jpg, png).

![start meeting](/doc/expanded_meeting.png)
- When a meeting starts an audio connection is made between the parties using a WebRTC connection.
- The expanded meeting card allows users to accept or decline meeting invitations as well as view the details about the meeting/
- The owner is able to start the meeting early

![Three users marking up a text document](/doc/meeting1.png)
- Once a meeting has started users are able to collaboratively markup a document
- Users are assigned a color for the tools they draw with. Their colours are displayed on the upper left
- In addition to audio chat, users may also use the in-meeting chat to communicate

![Three users marking up an image](/doc/meeting2.png)
- The application supports multiple page documents, and the owner of the meeting is able to cylce between the documents.

![a drawer showing all the tools available to the user and an in meeting chat](/doc/tools.png)
- Users can choose between a highlighter, pen, or pointer tool. They may optionally change the size of their tool
- An undo option is available to remove any pen or highlighter strokes users made by accident
- The 'write notes' options allows users to type of their own personal notes

![a user taking personal notes](/doc/pointer_and_notes.png)
- A user can type personal notes that can be retrieved.

![a history of the users meetings](/doc/history.png)
- After a meeting has concluded, it will appear in the history tab with all the details, the personalized notes, in addition to all the markedup documents which can be downloaded for later reference.



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
