const bcrypt = require('bcryptjs');

const User = require('../../models/user');
const { getEvents } = require('./merge-helpers');

module.exports = {
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
