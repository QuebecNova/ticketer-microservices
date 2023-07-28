import { Subjects } from "./Subjects"

export type TicketCreatedEvent = {
    subject: Subjects.TicketCreated;
    data: {
        id: string,
        title: string,
        price: number
    }
}