import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useRequest } from '../../hooks/useRequest'
import StripeCheckout from 'react-stripe-checkout'

export default function ViewOrder({ order, user }) {
    const [timeLeft, setTimeLeft] = useState(0)

    const router = useRouter()

    const { request, errors } = useRequest({
        url: '/api/v1/payments',
        method: 'post',
        onSuccess: () => router.push('/orders'),
    })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const secondsLeft = (new Date(order.expiresAt) - new Date()) / 1000
            setTimeLeft(secondsLeft)
        }

        calculateTimeLeft()

        const interval = setInterval(calculateTimeLeft, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    return secondsLeft <= 0 ? (
        <div>
            <h4>Purchasing {order.ticket.title}</h4>
            <div>Time left to pay {timeLeft} seconds</div>
            <StripeCheckout
                token={(token) => {
                    request({ orderId: order.id, token })
                }}
                stripeKey={process.env.STRIPE_KEY}
                amount={order.ticket.price * 100}
                email={user.email}
            />
            {errors}
        </div>
    ) : (
        <div>Order Expired...</div>
    )
}

LandingPage.getInitialProps = async (ctx, client, user) => {
    const { data } = await client.get('/api/v1/orders/' + ctx.query.ordersId)

    return { order: data }
}
