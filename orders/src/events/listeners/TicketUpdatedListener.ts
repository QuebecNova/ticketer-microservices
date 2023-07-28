import { Listener, Subjects, TicketUpdatedEvent } from "@quebecnovaorg/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated
    queueGroupName = queueGroupName

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const {title, price} = data 
        const ticket = await Ticket.findByIdAndPrevVersion(data)

        if (!ticket) {
            throw new Error('Ticket not found')
        }

        ticket.set({title, price})
        await ticket.save()

        msg.ack()
    }
}
