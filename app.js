const express = require('express');
const mongoose = require('mongoose');
const graphqlHTTP = require('express-graphql');
const expressPlayground = require('graphql-playground-middleware-express')
  .default;

const graphqlSchema = require('./graphql/schema/index');
const rootResolver = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app = express();

//--alternative to using bodyParser --no need to install bodyParser express covers it
app.use(express.json({ extended: false }));

//Solve CORS error  --Cross-Origin-Resource-Sharing --blocks sharing data/resources from different domains
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token '
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

//is-auth middleware
app.use(isAuth);

//graphql
app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: rootResolver,
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
