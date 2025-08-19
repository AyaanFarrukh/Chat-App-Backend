import { Users } from "../models/UserModel.mjs";

async function getUsers(request,response) {
  try {
    const users = await Users.find();
    return response.status(200).send({ success: true , users });
  } catch (error) {
    console.error(error);
    return response.status(500).send({ success: false , message: error.message || error });
  }
}

export default getUsers;