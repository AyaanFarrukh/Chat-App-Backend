import jwt from "jsonwebtoken";
import { Users } from "../models/UserModel.mjs";

async function GetUserDetailsWithToken(token) {
  if(!token) return false;
  const decodeUser = jwt.verify(token,process.env.JWT_SECRET_KEY);
  const user = await Users.findById(decodeUser.id);
  return user;
}

export default GetUserDetailsWithToken;