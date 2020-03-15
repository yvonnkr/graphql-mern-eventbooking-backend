const { buildSchema } = require('graphql');

module.exports = buildSchema(`
        type Booking {
            _id: ID!
            event: Event!
            user: User!
            createdAt: String!
            updatedAt: String!
        }

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type AuthData {
            userId: ID!
            token: String!
            tokenExpiration: Int!
        }

        type User {
          _id: ID!
          email: String!
          password: String
          createdEvents: [Event!]
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
            bookings: [Booking!]!
            events: [Event!]!  
            users: [User!]!
            login(email:String!, password: String!): AuthData!

        }

        type RootMutation {
            bookEvent(eventId: ID!): Booking!
            cancelBooking(bookingId:ID!): Event!
            createEvent(eventInput: EventInput!): Event
            createUser(userInput: UserInput!): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
         }
    `);
