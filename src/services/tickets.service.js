const context = require('./context.service');
const { ObjectId } = require('mongodb');

async function getTicketPrice(eventId, ticketId) {

    const objectIdPattern = /^[0-9a-fA-F]{24}$/;

    // TODO Gestire in modo diverso ??
    if(!objectIdPattern.test(eventId)){  // Non ho trovato l'evento --> Evento di TICKETMASTER --> Mando dato fittizzio
        return 25;
    }

    const event = await context
        .getCollection('events')
        .findOne({ _id: new ObjectId(eventId),  'tickets._id': new ObjectId(ticketId)});

    
    if (!event) {       
        throw new Error('Ticket not Found');
    }

    const tickets = event.tickets;
    const ticket = tickets.find(ticket => {
        const ticketIdObject = new ObjectId(ticketId);
        return ticket._id.equals(ticketIdObject);
    }
    );
    console.log(ticket);
    return ticket.price;
}


module.exports = { getTicketPrice };
