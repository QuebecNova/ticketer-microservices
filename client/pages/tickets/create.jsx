import { useRouter } from 'next/router'
import { useRequest } from '../../hooks/useRequest'

export default function CreateTicket() {
    const router = useRouter()

    const { request, errors } = useRequest({
        url: '/api/v1/tickets',
        method: 'post',
        onSuccess: (ticket) => router.push('/tickets/' + ticket.id),
    })

    const onSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        await request({
            title: formData.get('title'),
            price: formData.get('price'),
        })
    }

    return (
        <div>
            <h1>Create a Ticket</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input className="form-control" name="title" required />
                    <label>Price</label>
                    <input
                        className="form-control"
                        name="price"
                        min={0}
                        required
                        onBlur={(e) => {
                            e.target.value = parseFloat(
                                e.target.value || '0'
                            ).toFixed(2)
                        }}
                        step="any"
                    />
                </div>
                {errors}
                <button className="btn btn-primary">Create</button>
            </form>
        </div>
    )
}
