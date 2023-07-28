import { Publisher, Subjects, ExpirationCompletedEvent } from '@quebecnovaorg/common'

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent> {
    readonly subject = Subjects.ExpirationCompleted
}
