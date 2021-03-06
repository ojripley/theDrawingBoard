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
      throw error;
    });
};

const fetchContactsByUserId = function(user_id, username = '') {

  const vars = [user_id, `%${username}%`];

  return db.query(`
    SELECT username, id, email, relation FROM users
    JOIN friends ON friends.friend_id = users.id
    WHERE (friends.user_id = $1
    AND (username ILIKE $2
      OR email ILIKE $2)
    AND friends.relation = 'pending')
    OR (friends.user_id = $1
    AND (username ILIKE $2
      OR email ILIKE $2)
    AND friends.relation = 'requested')
    OR (friends.user_id = $1
    AND (username ILIKE $2
      OR email ILIKE $2)
    AND friends.relation = 'accepted');
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};


const fetchUsersByUsername = function(username = '', id) {

  const vars = [`%${username}%`, id];

  return db.query(`
    select id, username, email, relation
    from users left join friends on users.id = friends.user_id
    where (username ilike $1 or email ilike $1) and (friend_id is null)
    union
    select id, username, email, null as relation
    from users join friends on users.id=friends.user_id
    where (username ilike $1 or email ilike $1) and id != $2
    group by id having($2 != all(array_agg(friend_id)));
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};


const fetchMeetingsByUserId = function(username, meeting_status) {

  const vars = [username, meeting_status];

  return db.query(`
    SELECT start_time, end_time, name, description, active, link_to_initial_files, (select users.username FROM users WHERE users.id = meetings.owner_id) AS owner_username, meetings.id, status, array_agg(users.username) AS invited_users, array_agg(users.id) AS attendee_ids, array_agg(attendance) as attendances FROM meetings
    JOIN users_meetings ON users_meetings.meeting_id = meetings.id
    JOIN users ON users.id = users_meetings.user_id
    WHERE meetings.status = $2
    GROUP BY meetings.id
    HAVING $1 = any(array_agg(users.username))
    ORDER BY start_time
    LIMIT 20;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};

const removeUserFromMeeting = function(user_id, meeting_id) {

  const vars = [user_id, meeting_id];

  return db.query(`
    DELETE FROM users_meetings
    WHERE user_id = $1
    AND meeting_id = $2;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};

const fetchMeetingById = function(meeting_id) {

  const vars = [meeting_id];

  return db.query(`
    SELECT meetings.*, array_agg(users_meetings.user_id) as invited_users, array_agg(attendance) as attendances FROM meetings
    JOIN users_meetings on meetings.id = users_meetings.meeting_id
    WHERE meetings.id = $1
    GROUP BY meetings.id;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};

const fetchUsersMeetingsByIds = function(user_id, meeting_id) {
  const vars = [user_id, meeting_id];

  return db.query(`
    SELECT users_meetings.*, username FROM users_meetings
    JOIN users on users.id = users_meetings.user_id
    WHERE user_id = $1
    AND meeting_id = $2
    AND (attendance = 'accepted' OR attendance = 'invited');
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};

const fetchMeetingWithUsersById = function(meeting_id) {
  const vars = [meeting_id];

  return db.query(`
    SELECT start_time, end_time, name, description, active, (select users.username FROM users WHERE users.id = meetings.owner_id) AS owner_username, meetings.id, status, array_agg(users.username) AS invited_users, array_agg(users.id) AS attendee_ids, array_agg(attendance) as attendances FROM meetings
    JOIN users_meetings ON users_meetings.meeting_id = meetings.id
    JOIN users ON users.id = users_meetings.user_id
    WHERE meetings.id = $1
    GROUP BY meetings.id;
  `, vars)
    .then(res => {
      if (res.rows) {
      }
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
}

const insertUser = function(username, email, password) {

  const vars = [username, email, password];

  return db.query(`
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};

const insertMeeting = function(start_time, owner_id, name, description, status, link_to_initial_files) {

  const vars = [start_time, owner_id, name, description, status, link_to_initial_files];

  return db.query(`
    INSERT INTO meetings (start_time, owner_id, name, description, status, link_to_initial_files)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};

const insertUsersMeeting = function(user_id, meeting_id, status) {

  if (!status) {
    status = 'invited';
  }

  const vars = [user_id, meeting_id, status];

  return db.query(`
    INSERT INTO users_meetings (user_id, meeting_id, attendance)
    VALUES($1, $2, $3)
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};

const insertFriend = function(user_id, friend_id, status) {

  const vars = [user_id, friend_id, status];

  return db.query(`
    INSERT INTO friends (user_id, friend_id, relation)
    VALUES ($1, $2, $3);
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};

const updateFriendStatus = function(user_id, friend_id, relation) {

  const vars = [user_id, friend_id, relation];

  return db.query(`
    UPDATE friends
    SET relation = $3
    WHERE user_id = $1
    AND friend_id =$2;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};

const updateUsersMeetingsStatus = function(user_id, meeting_id, status) {

  const vars = [user_id, meeting_id, status];

  return db.query(`
    UPDATE users_meetings
    SET attendance = $3
    WHERE user_id = $1
    AND meeting_id = $2;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};

const updateUsersMeetingsNotes = function(user_id, meeting_id, notes) {
  const vars = [user_id, meeting_id, notes];

  return db.query(`
    UPDATE users_meetings
    SET notes = $3
    WHERE meeting_id = $2
    AND user_id = $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
};

const updateMeetingActiveState = function(meeting_id, active) {
  const vars = [meeting_id, active];

  return db.query(`
    UPDATE meetings
    SET active = $2
    WHERE id = $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
}

const updateMeetingById = function(meeting_id, end_time, active, status) {
  const vars = [meeting_id, end_time, active, status];

  return db.query(`
    UPDATE meetings
    SET
      end_time = $2,
      active = $3,
      status = $4
    WHERE id = $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
}

const updateMeetingLinksAndStatusById = function(meeting_id, link_to_initial_files, status) {
  const vars = [meeting_id, link_to_initial_files, status];

  return db.query(`
    UPDATE meetings
    SET
      link_to_initial_files = $2,
      status = $3
    WHERE id = $1;
  `, vars)
    .catch(error => {
      throw error;
    });
}

const deleteContact = function(user_id, contact_id) {
  const vars = [user_id, contact_id];

  return db.query(`
    DELETE FROM friends
    WHERE user_id = $1
    AND friend_id = $2;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
}

const deleteMeeting = function(meeting_id) {
  const vars = [meeting_id];

  return db.query(`
    DELETE FROM meetings
    WHERE id = $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error=> {
      throw error;
    })
}

const insertContactNotification = function(userId, n) {
  const vars = [userId, n.senderId, n.title, n.type, n.msg];

  return db.query(`
    INSERT INTO notifications (user_id, sender_id, title, type, msg)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error=> {
      throw error;
    });
}
const insertMeetingNotification = function(userId, n) {
  const vars = [userId, n.meetingId, n.title, n.type, n.msg];

  return db.query(`
  INSERT INTO notifications (user_id, meeting_id, title, type, msg)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error=> {
      throw error;
    });
}

const fetchNotificationsByUser = function(userId) {
  const vars = [userId];

  return db.query(`
    SELECT * FROM NOTIFICATIONS
    WHERE user_id = $1
    ORDER BY time DESC;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error=> {
      throw error;
    });
}

const removeNotificationById = function(id) {
  const vars = [id];

  return db.query(`
    DELETE FROM notifications
    WHERE id = $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error=> {
      throw error;
    });
}

const removeNotificationsByUserId = function(user_id) {
  const vars = [user_id];

  return db.query(`
    DELETE FROM notifications
    WHERE user_id = $1;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error=> {
      throw error;
    });
}

const removeNotificationsByType = function(user_id, type) {
  const vars = [user_id, type];

  return db.query(`
    DELETE FROM notifications
    WHERE user_id = $1
    AND type = $2;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error=> {
      throw error;
    });
}

const fetchStartedMeetings = function() {
  return db.query(`
    SELECT id, owner_id, name
    FROM meetings
    WHERE start_time BETWEEN now() - INTERVAL '60 seconds' AND now()
    AND active = false
    AND status = 'scheduled';
  `).then(res => {
    return res.rows;
  }).catch(error => {
    throw error;
  });
}

const clearToHistory = function() {
  console.log('-- SERVER STARTUP: CLEARING STALE MEETINGS --');

  return db.query(`
    UPDATE meetings
    SET
      active = 'false',
      status = 'past'
    WHERE active = 'true'
  `)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
}

const insertIntoDms = function(userId, recipientId, msg, time) {
  const vars = [userId, recipientId, msg, time];

  return db.query(`
    INSERT INTO dms (user_id, recipient_id, msg, time)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
}

const fetchDMs = function(userId, recipientId) {
  const vars = [userId, recipientId];

  return db.query(`
  SELECT * FROM (SELECT * FROM DMS
    WHERE (user_id=$1 AND recipient_id=$2)
    OR (user_id=$2 AND recipient_id=$1)
    ORDER BY time DESC
    LIMIT 20)
     as a ORDER BY time ASC
  `, vars)
    .then(res => {
      return res.rows;
    })
    .catch(error => {
      throw error;
    });
}

module.exports = {
  fetchUserByEmail,
  fetchContactsByUserId,
  fetchUsersByUsername,
  fetchMeetingsByUserId,
  fetchMeetingById,
  fetchUsersMeetingsByIds,
  fetchMeetingWithUsersById,
  fetchDMs,
  insertUser,
  insertMeeting,
  insertFriend,
  insertUsersMeeting,
  updateFriendStatus,
  updateUsersMeetingsStatus,
  updateUsersMeetingsNotes,
  updateMeetingActiveState,
  updateMeetingById,
  updateMeetingLinksAndStatusById,
  deleteContact,
  deleteMeeting,
  removeUserFromMeeting,
  insertContactNotification,
  insertMeetingNotification,
  fetchNotificationsByUser,
  removeNotificationById,
  removeNotificationsByUserId,
  removeNotificationsByType,
  fetchStartedMeetings,
  clearToHistory,
  insertIntoDms
};
