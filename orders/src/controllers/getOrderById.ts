import { Request, Response } from 'express'
import { Order } from '../models/order'
import { NotFoundError } from '@quebecnovaorg/common'

export const getOrderById = async (req: Request, res: Response) => {
    const { id } = req.params

    const order = await Order.findOne({
        _id: id,
        userId: req.user!.id,
    }).populate('ticket')

    if (!order) {
        throw new NotFoundError('Order not found')
    }

    res.send(order)
}
