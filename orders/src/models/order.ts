import mongoose from 'mongoose'
import { OrderStatus } from '@quebecnovaorg/common'
import { TicketDoc } from './ticket'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface OrderAttrs {
    ticket: TicketDoc
    status?: OrderStatus
    expiresAt?: Date
    userId: string
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build: (attrs: OrderAttrs) => Promise<OrderDoc>
}

export interface OrderDoc extends mongoose.Document {
    ticket: TicketDoc
    status: OrderStatus
    expiresAt: Date
    userId: string
    version: number;
}

const orderSchema = new mongoose.Schema(
    {
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Order must have a ticket ID that Order belongs to'],
            ref: 'Ticket'
        },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Created,
        },
        userId: {
            type: String,
            required: [true, 'Order must have a user ID that Order belongs to'],
            trim: true,
        },
        expiresAt: {
            type: Date
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


orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = async (attrs: OrderAttrs) => {
    return await new Order(attrs).save()
}

export const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)
