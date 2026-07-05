export const authMe = async (req, res) => {
    try {
        const user = req.user;//lay tu middlewares
        return res.status(200).json({
            user
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng authMe', error);
        return res.status(500).json({ message: "Loi he thong" });
    }
}