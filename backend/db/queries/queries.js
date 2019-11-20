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

const fetchFriendsByUserId = function(user_id) {

  const vars = [user_id];

  return db.query(`
    SELECT username, id, email FROM users
    JOIN friends ON friends.friend_id = users.id
    WHERE friends.user_id = $1;
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
    SELECT start_time, end_time, name, description, (select users.username FROM users WHERE users.id = meetings.owner_id) AS owner_username, meetings.id, status, users_meetings.notes, array_agg(users.username) AS invited_users FROM meetings
    JOIN users_meetings ON users_meetings.meeting_id = meetings.id
    JOIN users ON users.id = users_meetings.user_id
    WHERE meetings.status = $2
    GROUP BY meetings.id, users_meetings.notes
    HAVING $1 = any(array_agg(users.username))
    ORDER BY start_time
    LIMIT 20;
  `, vars)
    .then(res => {
      console.log(res)
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

const fetchMeetingById = function (meeting_id) {

  const vars = [meeting_id];

  return db.query(`
    SELECT * FROM meetings WHERE meetings.id = $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      console.error('Query Error', error);
    });
};

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

const insertMeeting = function (start_time, owner_id, name, status, link_to_inital_doc) {

  const vars = [start_time, owner_id, name, status, link_to_inital_doc];

  return db.query(`
    INSERT INTO meetings (start_time, owner_id, name, status, link_to_inital_doc)
    VALUES($1, $2, $3, $4, $5)
    RETURNING id;
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
    INSERT INTO users_meetings (user_id, meeting_id, status)
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

module.exports = { fetchUserByEmail, fetchFriendsByUserId, fetchMeetingsByUserId, fetchMeetingById, insertUser, insertMeeting, insertFriend, insertUsersMeeting, updateFriendStatus, updateUsersMeetingsStatus, updateUsersMeetingNotes };
