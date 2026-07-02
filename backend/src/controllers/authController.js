import bcrypt from "bcrypt";
import User from "../models/User.js";



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

    }
}