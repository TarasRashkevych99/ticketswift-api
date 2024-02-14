const context = require('./context.service');
const { ObjectId } = require('mongodb');

async function getTicketPrice(eventId, ticketId) {
    console.log(eventId, ticketId);
    const event = await context
        .getCollection('events')
        .findOne({ _id: new ObjectId(eventId),  'tickets._id': new ObjectId(ticketId)});

    if (!event) {
        throw new Error('Ticket not Found');
    }
    const tickets = event.tickets;
    const ticket = tickets.find(ticket => {
        //console.log('id: ' + ticket._id);
        //console.log('My id: ' + ticketId);
        const ticketIdObject = new ObjectId(ticketId);
        //console.log('My id: ' + ticketId);
        return ticket._id.equals(ticketIdObject);
    }
    );
    console.log(ticket);
    return ticket.price;
}


module.exports = { getTicketPrice };
