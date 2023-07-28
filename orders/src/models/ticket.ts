import mongoose from 'mongoose'
import { Order } from './order'
import { OrderStatus, omit } from '@quebecnovaorg/common'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface TicketAttrs {
    id?: string
    title: string
    price: number
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build: (attrs: TicketAttrs) => Promise<TicketDoc>
    findByIdAndPrevVersion: (query: {id: string, version: number}) => Promise<TicketDoc | null> 
}

export interface TicketDoc extends mongoose.Document {
    title: string
    price: number
    version: number;
    isReserved: () => Promise<boolean>
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Ticket must have a email'],
            unique: true,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Ticket must have a price'],
            min: 0,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id
                delete ret._id
                delete ret.__v
            },
        },
    }
)

ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

ticketSchema.statics.build = async (attrs: TicketAttrs) => {
    const newAttrs = omit(attrs, 'id')
    return await new Ticket({
        ...(attrs.id ? { _id: attrs.id } : {}),
        ...newAttrs,
    }).save()
}

ticketSchema.statics.findByIdAndPrevVersion = async ({id, version}) => {
    return Ticket.findOne({
        _id: id,
        version: version - 1
    })
}

ticketSchema.methods.isReserved = async function () {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Completed,
            ],
        },
    })

    return !!existingOrder
}

export const Ticket = mongoose.model<TicketDoc, TicketModel>(
    'Ticket',
    ticketSchema
)
