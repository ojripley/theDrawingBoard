const db = require('./poolSetup');

const fetchUserByEmail = function(email) {
  const vars = [email];

  return db.query(`
    SELECT *
    FROM users
    WHERE email = $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const fetchContactsByUserId = function(user_id, username = '') {

  const vars = [user_id, `%${username}%`];

  return db.query(`
    SELECT username, id, email FROM users
    JOIN friends ON friends.friend_id = users.id
    WHERE friends.user_id = $1
    AND username ILIKE $2;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const fetchUsersByUsername = function (username = '') {

  const vars = [`%${username}%`];

  return db.query(`
    SELECT username, email, id
    FROM users
    WHERE username ILIKE $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const fetchMeetingsByUserId = function (username, meeting_status) {

  const vars = [username, meeting_status];
  console.log(vars);

  return db.query(`
    SELECT start_time, end_time, name, description, active, (select users.username FROM users WHERE users.id = meetings.owner_id) AS owner_username, meetings.id, status, array_agg(users.username) AS invited_users FROM meetings
    JOIN users_meetings ON users_meetings.meeting_id = meetings.id
    JOIN users ON users.id = users_meetings.user_id
    WHERE meetings.status = $2
    GROUP BY meetings.id, users_meetings.notes
    HAVING $1 = any(array_agg(users.username))
    ORDER BY start_time
    LIMIT 20;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const fetchMeetingById = function (meeting_id) {

  const vars = [meeting_id];

  return db.query(`
    SELECT meetings.*, array_agg(users_meetings.user_id) as invited_users FROM meetings
    JOIN users_meetings on meetings.id = users_meetings.meeting_id
    WHERE meetings.id = $1
    GROUP BY meetings.id;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const fetchUsersMeetingsByIds = function(user_id, meeting_id) {
  const vars = [user_id, meeting_id];

  return db.query(`
    SELECT users_meetings.*, username FROM users_meetings
    JOIN users on users.id = users_meetings.user_id
    WHERE user_id = $1
    AND meeting_id = $2;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
}

const insertUser = function (username, email, password) {

  const vars = [username, email, password];

  return db.query(`
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3);
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const insertMeeting = function (start_time, owner_id, name, description, status, link_to_initial_doc) {

  const vars = [start_time, owner_id, name, description, status, link_to_initial_doc];

  return db.query(`
    INSERT INTO meetings (start_time, owner_id, name, description, status, link_to_initial_doc)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const insertUsersMeeting = function (user_id, meeting_id) {
  const vars = [user_id, meeting_id, 'invited'];

  return db.query(`
    INSERT INTO users_meetings (user_id, meeting_id, attendance)
    VALUES($1, $2, $3)
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const insertFriend = function (user_id, friend_id, status) {

  const vars = [user_id, friend_id, status];

  return db.query(`
    INSERT INTO friends (user_id, friend_id, status)
    VALUES ($1, $2, $3);
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const updateFriendStatus = function (user_id, status) {

  const vars = [user_id, status];

  return db.query(`
    UPDATE friends
    SET status = $2
    WHERE user_id = $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const updateUsersMeetingsStatus = function (user_id, status) {

  const vars = [user_id, status];

  return db.query(`
    UPDATE users_meetings
    SET status = $2
    WHERE user_id = $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const updateUsersMeetingNotes = function (user_id, notes) {
  const vars = [user_id, meeting_id, notes];

  return db.query(`
    UPDATE users_meetings
    SET notes = $2
    WHERE user_id = $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const updateMeetingActiveState = function(meeting_id, status) {
  const vars = [meeting_id, status];

  return db.query(`
    UPDATE meetings
    SET active = $2
    WHERE id = $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
}

module.exports = { fetchUserByEmail, fetchContactsByUserId, fetchUsersByUsername, fetchMeetingsByUserId, fetchMeetingById, fetchUsersMeetingsByIds, insertUser, insertMeeting, insertFriend, insertUsersMeeting, updateFriendStatus, updateUsersMeetingsStatus, updateUsersMeetingNotes, updateMeetingActiveState };
