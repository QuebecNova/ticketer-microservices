import { Ticket } from '../../models/ticket'
import { createTicket } from './createTicket.test'

it('implements optimistic concurrency control', async () => {
    const ticket = (await createTicket())[0]

    const firstInstance = await Ticket.findById(ticket.id)
    const secondInstance = await Ticket.findById(ticket.id)

    firstInstance!.set({ price: 10 })
    secondInstance!.set({ price: 15 })

    await firstInstance!.save()
    try {
        await secondInstance!.save()
    } catch (err) {
        return
    }

    throw new Error('Should not reach this point')
})

it('increments version number on multiple saves', async () => {
    const ticket = (await createTicket())[0]

    const ticketInstance = await Ticket.findById(ticket.id)

    expect(ticketInstance!.version).toEqual(0)
    await ticketInstance!.save()
    expect(ticketInstance!.version).toEqual(1)
    await ticketInstance!.save()
    expect(ticketInstance!.version).toEqual(2)
    await ticketInstance!.save()
    expect(ticketInstance!.version).toEqual(3)

})
