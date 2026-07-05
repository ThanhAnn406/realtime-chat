import bcrypt from "bcrypt";
import User from "../models/User.js";
import Session from "../models/Session.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";


const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngay theo miligiay
export const signUp = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: "Please fill all the fields" })
        }
        //kiem tra username ton tai chua
        const user = await User.findOne({ username });
        if (user) {
            return res.status(409).json({ message: "User already exists" });
        }
        //ma hoa password
        const hashPassword = await bcrypt.hash(password, 10);//salt = 10 vòng

        //tao user moi
        await User.create({
            username,
            email,
            password: hashPassword,
            displayName: `${firstName} ${lastName}`
        })
    } catch (error) {
        console.error("Lỗi khi signUp", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
    return res.status(201).json({ message: "User registered successfully" });
}

export const signIn = async (req, res) => {
    try {
        //lay input cua req body
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Thieu username hoac password" });
        }
        //lay hashedPassword trong db de so sanh voi pw mg dung vua nhap
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "user hoac password khong ton tai" });
        }
        //kiem tra password
        const passwordCorrect = await bcrypt.compare(password, user.password);
        if (passwordCorrect == false) {
            return res.status(401).json({ message: "user hoac password khong ton tai" });
        }
        //neu khop tao accesstoken voi JWT
        const accesstoken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL })

        //tao refresh token
        const refreshToken = crypto.randomBytes(64).toString("hex");

        //luu refresh token vao session db
        const expiresAt = new Date(Date.now() + Number(REFRESH_TOKEN_TTL))
        await Session.create({
            userId: user._id,
            refreshToken: refreshToken,
            expiresAt: expiresAt
        })

        //tra refreshToken ve trong cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, //ko the truy cap tu client
            secure: true,
            sameSite: 'none',//backend va frontend deploy rieng
            maxAge: Number(REFRESH_TOKEN_TTL)
        })
        //tra ve accesstoken trong res
        return res.status(200).json({ message: `User ${user.displayName} logged in successfully`, accesstoken });
    } catch (error) {
        console.error("Lỗi khi signIn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

