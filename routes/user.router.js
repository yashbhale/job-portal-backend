import express from "express"
import {login,register,updateprofile,logout} from "../controllers/user.js"
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router=express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('profile/update').post(isAuthenticated,updateprofile);
router.route('/logout').get(logout);



export default router;
