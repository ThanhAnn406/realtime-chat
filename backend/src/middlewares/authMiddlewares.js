import jwt from "jsonwebtoken";
import User from "../models/User.js";


//authorization middleware-xac minh user la ai
export const protecteRoute = async (req, res, next) => {
    try {
        //lay accesstoken tu header
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Không tìm thấy access token" });
        }

        //xac nhan token co hop le hay khong
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            if (err) {
                return res
                    .status(403)
                    .json({ message: "Access token hết hạn hoặc không đúng" });
            }
            //tìm user
            const user = await User.findById(decodedUser.userId).select("-password");
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }
            //trả user về trong req
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Lỗi khi xác minh jwt authMiddlewares', error);
        return res.status(500).json({ message: "Loi he thong" });
    }
}
