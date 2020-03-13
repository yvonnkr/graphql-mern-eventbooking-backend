const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const expressPlayground = require('graphql-playground-middleware-express')
  .default;
const mongoose = require('mongoose');

const app = express();

const events = [
  {
    _id: Math.random().toString(),
    title: 'All-Night Coding',
    description: 'Complete graphql course',
    price: 149.99,
    date: new Date().toISOString()
  }
];

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
        }
        type RootQuery {
            events: [Event!]!  
        }
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        type RootMutation {
            createEvent(eventInput: EventInput!): Event
        }
        schema {
            query: RootQuery
            mutation: RootMutation
         }
    `),
    rootValue: {
      events: () => {
        return events;
      },
      createEvent: args => {
        const { title, description, price, date } = args.eventInput;
        const event = {
          _id: Math.random().toString(),
          title,
          description,
          price,
          date
        };

        events.push(event);

        return event;
      }
    },
    graphiql: true //--localhost:5000/graphql
  })
);

//alt to graphiql --localhost:5000/playground   --npm i 'graphql-playground-middleware-express' then require as above
app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

//connect to db then app.listen
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log('Connected to database');

    app.listen(PORT, () => {
      console.log(`Server up on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));
