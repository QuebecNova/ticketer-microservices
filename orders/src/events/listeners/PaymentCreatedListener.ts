import { Listener, Subjects, PaymentCreatedEvent, OrderStatus } from "@quebecnovaorg/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated
    queueGroupName = queueGroupName

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const {orderId} = data 
        
        await Order.findByIdAndUpdate(orderId, {
            status: OrderStatus.Completed
        })

        msg.ack()
    }
}