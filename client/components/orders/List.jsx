import { useRouter } from 'next/router'

export function OrdersList({ orders }) {
    return (
        <div>
            <h1>Orders</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr>
                            <td>{order.ticket.title}</td>
                            <td>{order.ticket.price}</td>
                            <td>{order.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
