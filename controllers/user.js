import { user} from "../models/user.js";
import bcrypt from 'bcrypt'
import Cookies from 'js-cookie'
import jwt from  "jsonwebtoken"


export const register = async(req,res)=> {

    try {
        const {name,email,password,phoneno}=req.body;
        if(!name || !email ||!password ||!phoneno) {
            console.log("error here1");
            return res.status(400).json({
                message:"All details are not there",
                success:false,
            });
        }

        const userone= await user.findOne({email});
        console.log("1111111111111111")
        if(userone) {
            console.log("error here2",email,userone);
            return res.status(400).json({
                message:"User already Exists",
                success:false,
            })
        }

        const hashedpassword= await bcrypt.hash(password,10);

        await user.create({
            name,
            email,
            password:hashedpassword,
            phoneno,
        });
        return res.status(201).json({
            message: "User registered successfully",
            success: true,
        });
        
    } catch(error) {
        console.error(error);
        console.log("error here3");
        return res.status(500).json({message:"Internal sever error",success:false});
    }
    
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email,password);

        if (!email || !password) {
            console.log("error 1");
            return res.status(400).json({
                message: "Email and password are required.",
                success: false,
            });
        }

        const user1 = await user.findOne({ email });
        if (!user1) {
            console.log("error 2");
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user1.password);
        if (!isPasswordValid) {
            console.log("error 3");
            return res.status(400).json({
                message: "Incorrect password.",
                success: false,
            });
        }

        const tokenData = { userId: user1._id };
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '3d' });
        console.log("no error in login backend",process.env.SECRET_KEY);
        return res
            .status(200)
            .cookie("token", token, {
                maxAge:3*24*3600*1000,
                httpOnly:true,
                sameSite: 'None',
                secure: process.env.NODE_ENV === 'production'
            })
            .json({
                message: "Login successful.",
                success: true,
                token, // Optional: send token in response for debugging
            });

    } catch (error) {
        console.error("Error during login:", error.message);
        console.log("Error during login:", error.message);

        return res.status(500).json({
            message: "Internal server error.",
            success: false,
        });
    }
};


export const logout = async(req,res)=> {
    try {
        return res.status(200).cookie("token","",{maxAge:0}).json({
            message:"Logged Out",
            success:true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal sever error",success:false});
    }
}


export const updateprofile= async(req,res)=> {
    const {name,email,phoneno,skills,cgpa,experience,gradyear}=req.body;
    const file=req.file;
    const skillsarray=skills.split(",");
    
    const userId=req._id;
    let user1 = await user.findById(userId);
    if(!user1) {
        return res.status(404).json({
            message:"something went wrong",
            success:false,
        })
    }

    if(name) user1.name=name;
    if(email) user1.email=email;
    if(phoneno) user1.phoneno=phoneno;
    if(skills) user1.skills=skillsarray;
    if(cgpa) user1.cgpa=cgpa;
    if(experience) user1.experience=experience;
    if(gradyear) user1.gradyear=gradyear;

    await user1.save();

    return res.status(200).json({
        message:"Profile updated Successfully",
        user1,
        success:true,
    })
}

