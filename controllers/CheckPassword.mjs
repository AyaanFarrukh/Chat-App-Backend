import dotenv from "dotenv"
dotenv.config();
import { request, response } from "express";
import { Users } from "../models/UserModel.mjs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

async function checkPassword(request,response) {
    try {
        const { password , userId } = request.body;
        const findedUser = await Users.findById(userId);
        const verifiedPassword = await bcrypt.compare(password,findedUser.password);
        if(!verifiedPassword) return response.status(400).send({ success: false, verified: false});
        const tokenData = { id: findedUser.id, email: findedUser.email }
        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY);
        const cookiesOption = { http: true , secure: true };
        return response.cookie("token",token,cookiesOption).status(200).send({ success: true , user: findedUser, token });
    } catch (error) {
        console.error(error);
        return response.status(500).send({ success: false , message: error.message || error });
    }
}

export default checkPassword;