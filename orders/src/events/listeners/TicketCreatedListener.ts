import { Listener, Subjects, TicketCreatedEvent } from "@quebecnovaorg/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated
    queueGroupName = queueGroupName

    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        const {id, title, price} = data 
        const ticket = await Ticket.build({title, price, id})
        msg.ack()
    }
}