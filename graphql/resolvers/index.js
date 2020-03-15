const eventsResolver = require('./events');
const bookingResolver = require('./booking');
const authResolver = require('./auth');

//root-resolver
const rootResolver = {
  ...eventsResolver,
  ...bookingResolver,
  ...authResolver
};

module.exports = rootResolver;
