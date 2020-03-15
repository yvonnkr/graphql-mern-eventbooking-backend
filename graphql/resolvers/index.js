const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

//helper func
const getEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: async () => getUser(event.creator)
      };
    });
  } catch (err) {
    throw err;
  }
};

//helper func
const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return {
      ...event._doc,
      _id: event.id,
      creator: async () => getUser(event.creator)
    };
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

//resolvers
module.exports = {
  //query
  bookings: async () => {
    try {
      const bookings = await Booking.find();

      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          user: async () => await getUser(booking._doc.user),
          event: async () => await singleEvent(booking._doc.event),
          createdAt: new Date(booking.createdAt).toISOString(),
          updatedAt: new Date(booking.updatedAt).toISOString()
        };
      });
    } catch (err) {
      throw err;
    }
  },
  //query
  events: async () => {
    try {
      const events = await Event.find();

      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event.date).toISOString(),
          creator: async () => getUser(event.creator)
        };
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  //query
  users: async () => {
    try {
      const users = await User.find();

      return users.map(user => {
        return {
          ...user._doc,
          _id: user.id,
          password: null,
          createdEvents: async () => getEvents(user.createdEvents)
        };
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  //mutation
  bookEvent: async args => {
    try {
      const fetchedEvent = await Event.findById(args.eventId);
      if (!fetchedEvent) throw new Error('Event not found');

      const createdBooking = new Booking({
        event: fetchedEvent,
        user: '5e6c02914dbf273fdca0233a'
      });

      const result = await createdBooking.save();

      return {
        ...result._doc,
        _id: result.id,
        user: async () => await getUser(result.user),
        event: async () => await singleEvent(result.event),
        createdAt: new Date(result.createdAt).toISOString(),
        updatedAt: new Date(result.updatedAt).toISOString()
      };
    } catch (err) {
      throw err;
    }
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      if (!booking) throw new Error('Booking not found');
      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: async () => await getUser(booking.event._doc.creator)
      };

      await Booking.deleteOne({ _id: args.bookingId });

      return event;
    } catch (err) {
      throw err;
    }
  },
  //mutation
  createEvent: async args => {
    const { title, description, price, date } = args.eventInput;

    const event = new Event({
      title,
      description,
      price,
      date: new Date(date),
      creator: '5e6c02914dbf273fdca0233a'
    });

    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = {
        ...result._doc,
        _id: result._doc._id.toString(),
        date: new Date(event._doc.date).toISOString(),
        creator: async () => getUser(result._doc.creator)
      };
      const creator = await User.findById('5e6c02914dbf273fdca0233a');

      if (!creator) {
        throw new Error('User not found.');
      }
      creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  //mutation
  createUser: async args => {
    const { email, password } = args.userInput;

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error('User already exists');
    }

    let hashedPassword;

    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      console.log(err);
      throw err;
    }

    const user = new User({ email, password: hashedPassword });

    try {
      const result = await user.save();
      return { ...result._doc, password: null };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};
