const express = require('express');
const graphqlHTTP = require('express-graphql');
const expressPlayground = require('graphql-playground-middleware-express')
  .default;
const mongoose = require('mongoose');

const graphqlSchema = require('./graphql/schema/index');
const graphqlResolvers = require('./graphql/resolvers/index');

const app = express();

//--alternative to using bodyParser --no need to install bodyParser express covers it
app.use(express.json({ extended: false }));

//simple schema/resolvers
app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
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
