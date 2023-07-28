import { Listener, OrderCancelledEvent, Subjects } from "@quebecnovaorg/common";
import { queueGroupName } from "./queueGroupName";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/TicketUpdatedPublisher copy";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject =  Subjects.OrderCancelled
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id)

        if (!ticket) {
            throw new Error('Ticket not found')
        }

        await ticket.set('orderId', undefined).save()

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,  
            orderId: ticket.orderId,
            version: ticket.version,
        })

        msg.ack()
    }
}