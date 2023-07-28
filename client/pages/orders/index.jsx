import { OrdersList } from "../../components/orders/List";

export default function Orders({orders}) {
  return (
    <OrdersList orders={orders}/>
  )
}

Orders.getInitialProps = async (ctx, client, user) => {
    const {data } = await client.get('/api/v1/orders')
  
    return {orders: data}
  }