import "bootstrap/dist/css/bootstrap.css";
import { buildClient } from "../api/buildClient";
import { Header } from "../components/Header";

export default function _app({ Component, pageProps, user }) {
  return (
    <div>
      <Header user={user}/>
      <Component {...pageProps} user={user}/>
    </div>
  );
}

_app.getInitialProps = async ({Component, ctx}) => {
  const client = buildClient(ctx);
  try {
    const { data } = await client.get("/api/v1/users/current-user");
    
    let pageProps = {}
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx, client, data.user)
    }

    return {pageProps, ...data};
  } catch (err) {
    return {};
  }
};
