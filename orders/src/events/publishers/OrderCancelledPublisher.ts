import { Publisher, Subjects, OrderCancelledEvent } from '@quebecnovaorg/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled
}
