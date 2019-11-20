select start_time, name, (select users.username from users where users.id = meetings.owner_id) as owner_username, meetings.id, users_meetings.link_to_notes, status, array_agg(users.username) as invited_users from meetings
join users_meetings on users_meetings.meeting_id = meetings.id
join users on users.id = users_meetings.user_id
where meetings.status = 'past'
group by meetings.id, users_meetings.link_to_notes
having  'ta' = any(array_agg(users.username))
order by start_time
limit 20;
