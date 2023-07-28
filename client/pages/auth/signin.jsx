import { useRouter } from "next/router";
import { useRequest } from "../../hooks/useRequest";

export default function SignIn() {
  const router = useRouter();
  
  const { request, errors } = useRequest({
    url: "/api/v1/users/signin",
    method: "post",
    onSuccess: () => router.push("/"),
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await request({
      email: formData.get("email"),
      password: formData.get("password"),
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign In</h1>
      <div className="form-group">
        <label>Email</label>
        <input className="form-control" name="email" required />
        <label>Password</label>
        <input className="form-control" name="password" required />
      </div>
      {errors}
      <button className="btn btn-primary">Sign In</button>
    </form>
  );
}
