import { useRouter } from "next/router";
import { useRequest } from "../../hooks/useRequest";
import { useEffect } from "react";

export default function signout() {
  const router = useRouter();
  
  const { request } = useRequest({
    url: "/api/v1/users/signout",
    method: "get",
    onSuccess: () => router.push("/"),
  });

  useEffect(() => {
    request();
  }, []);

  return <div>Signing out...</div>;
}
