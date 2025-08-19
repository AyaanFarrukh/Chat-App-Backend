import { Router } from "express";
import RegisterUser from "../controllers/RegisterUser.mjs";
import checkEmail from "../controllers/CheckEmail.mjs";
import checkPassword from "../controllers/CheckPassword.mjs";
import GetUserDetails from "../controllers/UserDetails.mjs";
import LogOut from "../controllers/Logout.mjs";
import UpdateUserDetails from "../controllers/updateUser.mjs";
import upload from "../config/upload.mjs";
import getUsers from "../controllers/getUsers.mjs";

const router = Router();

router.post("/register",upload.single("profile_pic"), RegisterUser);
router.post("/email", checkEmail);
router.post("/password", checkPassword);
router.post("/user-details", GetUserDetails);
router.post("/logout",LogOut);
router.post("/update-user",upload.single("profile_pic"), UpdateUserDetails);
router.get("/get-users", getUsers);

export default router;