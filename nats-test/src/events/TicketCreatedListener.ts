import { Message } from "node-nats-streaming";
import { Listener } from "./Listener";
import { TicketCreatedEvent } from "./ticketCreatedEvent";
import { Subjects } from "./Subjects";

export class TicketCreatedListner extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated 
    queueGroupName = 'payments-service';
    onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
        console.log(data)

        msg.ack()
    }
}