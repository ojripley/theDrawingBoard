select * from users
join friends on friends.friend_id = users.id
where friends.user_id = 1;
