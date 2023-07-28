import { TicketsList } from "../components/tickets/List";

export default function LandingPage({ user, tickets }) {
  return <div className="container">{user ? <TicketsList tickets={tickets}/> : "Sign up please!"}</div>;
}

LandingPage.getInitialProps = async (ctx, client, user) => {
  const {data } = await client.get('/api/v1/tickets')

  return {tickets: data}
}