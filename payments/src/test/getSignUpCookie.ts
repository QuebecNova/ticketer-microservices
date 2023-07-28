import jwt from "jsonwebtoken";

export const cookieUserId = "userId"

export const getSignUpCookie = (newId = false) => {
  const token = jwt.sign(
    {
      id: newId ? `randomId-${Math.random() * 100}`: cookieUserId,
      email: "test@test.com",
    },
    process.env.JWT_KEY!
  );

  const session = JSON.stringify({ jwt: token });

  const base64 = Buffer.from(session).toString("base64");

  return [`session=${base64}`];
};
