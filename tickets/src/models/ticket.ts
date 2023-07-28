import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface TicketAttrs {
    title: string
    price: number
    userId: string
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build: (attrs: TicketAttrs) => Promise<TicketDoc>
}

export interface TicketDoc extends mongoose.Document {
    title: string
    price: number
    userId: string
    version: number
    orderId?: string
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
        userId: {
            type: String,
            required: [
                true,
                'Ticket must have a user ID that ticket belongs to',
            ],
            trim: true,
        },
        orderId: String
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
    return await new Ticket(attrs).save()
}

export const Ticket = mongoose.model<TicketDoc, TicketModel>(
    'Ticket',
    ticketSchema
)
