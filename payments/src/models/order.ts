import mongoose from 'mongoose'
import { OrderStatus, omit } from '@quebecnovaorg/common'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface OrderAttrs {
    price: number
    status?: OrderStatus
    userId: string
    version: number
    id: string
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build: (attrs: OrderAttrs) => Promise<OrderDoc>
}

export interface OrderDoc extends mongoose.Document {
    price: number
    status: OrderStatus
    userId: string
    version: number
}

const orderSchema = new mongoose.Schema(
    {
        price: {
            type: Number,
            required: [true, 'Order must have a price'],
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
    const newAttrs = omit(attrs, 'id')
    return await new Order({
        ...(attrs.id ? { _id: attrs.id } : {}),
        ...newAttrs,
    }).save()
}

export const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)
