const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

//helper functions
const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      };
    });
    return events;
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();

      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event.date).toISOString(),
          creator: user.bind(this, event.creator)
        };
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  users: async () => {
    try {
      const users = await User.find()
        .select('-password')
        .populate('createdEvents');
      return users;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
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
        creator: user.bind(this, result._doc.creator)
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

    // try {
    //   const user = await User.findById('5e6c02914dbf273fdca0233a');
    //   if (!user) throw new Error('User with given id not found');
    //   user.createdEvents.push(event);
    //   await user.save();

    //   const result = await event.save();
    //   return result;
    // } catch (err) {
    //   console.log(err);
    //   throw err;
    // }
  },
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
