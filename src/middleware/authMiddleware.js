const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleWare = (req, res, next) => {
    const token = req.headers.token?.split(' ')[1];
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET , function (err, user) {
        if(err) {
            console.error("JWT Verify Error:", err);
            return res.status(404).json({
                message: "The authenication",
                status: "Error"
            });
        }
        if(user?.isAdmin) {
            next();
        }
        else {
            return res.status(404).json({
                message: "Không tìm thấy OK user",
                status: "Error"
            });
        }
    });
}

const authUserMiddleWare = (req, res, next) => {
    const token = req.headers.token?.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, user) {
        if (err) {
            console.error("JWT Verify Error:", err);
            return res.status(404).json({
                message: "Authentication failed huhu",
                status: "Error"
            });
        }
        if (user?.isAdmin || user) {
            req.user = user; // Lưu thông tin user để sử dụng sau này
            next();
        } else {
            return res.status(404).json({
                message: "User not found",
                status: "Error"
            });
        }
    });
};


module.exports = {
    authMiddleWare,
    authUserMiddleWare
}
