import GetUserDetailsWithToken from "../helpers/UserDetailsToken.mjs";
import { Users } from "../models/UserModel.mjs";

async function UpdateUserDetails(request,response) {
    try {
        console.log("here i am")
        const authHeader = request.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        console.log(token);
        const user = await GetUserDetailsWithToken(token);
        if(!user) return response.status(401).send({ success: false, loggedIn: false });
        const { name, profile_pic } = request.body;
        const updatedUser = await Users.findByIdAndUpdate(user.id,{ name: name ? name : user.name , profile_pic: request.file ? 
            request.file.path : user.profile_pic
         }, { new: true });
        return response.status(200).send({ success: true , updatedUser });
    } catch (error) {
        console.error(error);
        return response.status(500).send({ success: false , message: error.message || error });
    }
}

export default UpdateUserDetails;