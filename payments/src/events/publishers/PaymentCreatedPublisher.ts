import { Publisher, Subjects, PaymentCreatedEvent } from '@quebecnovaorg/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated
}
