const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

  //query
  login: async args => {
    const { email, password } = args;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_PRIVATE_KEY,
        {
          expiresIn: '1h'
        }
      );

      //return type AuthData
      return {
        userId: user.id,
        token,
        tokenExpiration: 1
      };
    } catch (err) {
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
