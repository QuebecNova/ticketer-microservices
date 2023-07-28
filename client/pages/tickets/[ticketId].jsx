import { useRouter } from 'next/router'
import { useRequest } from '../../hooks/useRequest'

export default function ViewTicket({ ticket }) {
    const router = useRouter()

    const { request, errors } = useRequest({
        url: '/api/v1/orders',
        method: 'post',
        onSuccess: (order) => router.push('/orders/' + order.id),
    })

    const onPurchaseBtnClick = (e) => {
        request({ ticketId: ticket.id })
    }

    return (
        <div>
            <h1>{ticket.title}</h1>
            <h4>{ticket.price}</h4>
            <button className="btn btn-primary" onClick={onPurchaseBtnClick} disabled={!!ticket.orderId}>
                {ticket.orderId ? 'Already Reserved' : 'Purchase'}
            </button>
            {errors}
        </div>
    )
}

LandingPage.getInitialProps = async (ctx, client, user) => {
    const { data } = await client.get('/api/v1/tickets/' + ctx.query.ticketId)

    return { ticket: data }
}
