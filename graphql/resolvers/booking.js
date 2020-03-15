const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { transformBooking, transformEvent } = require('./merge-helpers');

module.exports = {
  //query
  bookings: async () => {
    try {
      const bookings = await Booking.find();

      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (err) {
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

      return transformBooking(result);
    } catch (err) {
      throw err;
    }
  },
  //mutation
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      if (!booking) throw new Error('Booking not found');
      const event = transformEvent(booking.event);

      await Booking.deleteOne({ _id: args.bookingId });

      return event;
    } catch (err) {
      throw err;
    }
  }
};
