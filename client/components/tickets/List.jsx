import { useRouter } from 'next/router'

export function TicketsList({ tickets }) {
    const router = useRouter()
    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((ticket) => (
                        <tr>
                            <td>{ticket.title}</td>
                            <td>{ticket.price}</td>
                            <td>{ticket.orderId ? 'Reserved' : 'Available'}</td>
                            <td>
                                <button
                                    className="btn btn-primary"
                                    onClick={router.push(
                                        '/tickets/' + ticket.id
                                    )}
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
