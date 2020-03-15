const User = require('../../models/user');
const Event = require('../../models/event');
const { dateToString } = require('../../helpers/date');

//helper func
const getEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return transformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

//helper func
const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch (err) {
    throw err;
  }
};

//helper func
const getUser = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: async () => getEvents(user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

//helper func
const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: async () => getUser(event.creator)
  };
};

//helper func
const transformBooking = booking => {
  return {
    ...booking._doc,
    _id: booking.id,
    user: async () => await getUser(booking._doc.user),
    event: async () => await singleEvent(booking._doc.event),
    createdAt: dateToString(booking.createdAt),
    updatedAt: dateToString(booking.updatedAt)
  };
};

exports.getEvents = getEvents;
exports.getUser = getUser;
exports.singleEvent = singleEvent;
exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
