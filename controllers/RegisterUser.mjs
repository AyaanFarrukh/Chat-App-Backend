import { Users } from "../models/UserModel.mjs";
import bcrypt from "bcrypt";

async function RegisterUser(request,response) {
    try {
        const { name, email, password,} = request.body;
        const EmailExists = await Users.findOne({ email });
        if(EmailExists) return response.status(400).send({ success: false , exists: true });
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password,salt);
        const payload = { name, email, password: hashedPassword, profile_pic: request.file.path ? request.file.path : null  };
        const newUser = new Users(payload);
        const SavedUser = await newUser.save();
        return response.status(201).send({ success: true, userData: SavedUser });
    } catch (error) {
        console.error(error);
        return response.status(500).send({ success: false , message: error.message || error });
    } 
}

export default RegisterUser;