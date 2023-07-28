import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface PaymentAttrs {
    orderId: string;
    chargeId: string
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build: (attrs: PaymentAttrs) => Promise<PaymentDoc>
}

export interface PaymentDoc extends mongoose.Document {
    orderId: string;
    chargeId: string;
    version: number;
}

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: [
                true,
                'Payment must have a user ID that Payment belongs to',
            ],
            trim: true,
        },
        chargeId: {
            type: String,
            required: [
                true,
                'Payment must have a stripe charge ID that Payment belongs to',
            ],
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

paymentSchema.set('versionKey', 'version')
paymentSchema.plugin(updateIfCurrentPlugin)

paymentSchema.statics.build = async (attrs: PaymentAttrs) => {
    return await new Payment(attrs).save()
}

export const Payment = mongoose.model<PaymentDoc, PaymentModel>(
    'Payment',
    paymentSchema
)
