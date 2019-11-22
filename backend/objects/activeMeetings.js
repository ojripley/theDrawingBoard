class ActiveMeeting {

  // meetings will be added to this object with their ids as the key

  addMeeting(meeting) {
    this[meeting.id] = meeting;
  }

  removeMeeting(id) {
    delete this[id];
  }
}

module.exports = { ActiveMeeting };
