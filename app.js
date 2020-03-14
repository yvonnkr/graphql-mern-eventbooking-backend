const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const expressPlayground = require('graphql-playground-middleware-express')
  .default;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

//--alternative to using bodyParser --no need to install bodyParser express covers it
app.use(express.json({ extended: false }));

//simple schema/resolvers
app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: String
        }
        type User {
          _id: ID!
          email: String!
          password: String
          createdEvents: [String]
        }
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        input UserInput {
          email: String!
          password: String!
        }
        type RootQuery {
            events: [Event!]!  
            users: [User!]!
        }
        type RootMutation {
            createEvent(eventInput: EventInput!): Event
            createUser(userInput: UserInput!): User
        }
        schema {
            query: RootQuery
            mutation: RootMutation
         }
    `),
    rootValue: {
      events: async () => {
        try {
          const events = await Event.find();
          return events;
        } catch (err) {
          console.log(err);
          throw err;
        }
      },
      users: async () => {
        try {
          const users = await User.find().select('-password');
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

        try {
          const user = await User.findById('5e6c02914dbf273fdca0233a');
          if (!user) throw new Error('User with given id not found');
          user.createdEvents.push(event);
          await user.save();

          const result = await event.save();
          return result;
        } catch (err) {
          console.log(err);
          throw err;
        }
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
    },
    graphiql: true //--localhost:5000/graphql
  })
);

//alt to graphiql --localhost:5000/playground   --npm i 'graphql-playground-middleware-express'
app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

//connect to db then app.listen
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => {
    console.log('Connected to database');

    app.listen(PORT, () => {
      console.log(`Server up on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));
