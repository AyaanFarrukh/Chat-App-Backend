import { Users } from "../models/UserModel.mjs";

async function checkEmail(request,response) {
    try {
        const { email } = request.body;
        const EmailExists = await Users.findOne({ email }).select("-password");
        console.log(EmailExists)
        if(!EmailExists) return response.status(400).send({ success: false , exists: false });
        return response.status(200).send({ success: true, email: true , data: EmailExists });
    } catch (error) {
        console.error(error);
        return response.status(500).send({ success: false , message: error.message || error });
    }
}

export default checkEmail;