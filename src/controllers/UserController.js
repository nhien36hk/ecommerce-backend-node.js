const UserService = require('../services/UserService');
const JwtService = require('../services/JwtService');

const createUser = async (req,res) => {
    try {
        const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const {name, email, password, confirmPassword, phone} = req.body;
        const isCheckEmail = reg.test(email);
        
        if(!email || !password || !confirmPassword) {
            return res.status(400).json({
                status: "error",
                message: "Các trường dữ liệu là bắt buộc"
            });
        }
        else if (!isCheckEmail) {
            return res.status(400).json({
                status: "error",
                message: "Bạn phải nhập đúng định dạng email"
            });
        }
        else if (password !== confirmPassword) {
            return res.status(400).json({
                status: "error",
                message: "Hãy nhập password trùng confirmPassword"
            });
        }
        //Truyền req.body sang UserService gán vào newUser
        const response = await UserService.createUser(req.body);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            mesage: error
        });
    }
}

const loginUser = async (req,res) => {
    try {
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const { email, password} = req.body;
        const isCheckEmail = reg.test(email);
        
        if(!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Các trường dữ liệu là bắt buộc"
            });
        }
        else if (!isCheckEmail) {
            return res.status(400).json({
                status: "error",
                message: "Bạn phải nhập đúng định dạng email"
            });
        }
        //Truyền req.body sang UserService gán vào newUser
        const response = await UserService.loginUser(req.body);
        const {refresh_token, ...newResponse} = response;
        console.log(refresh_token);
        
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            samesite: 'strict'

        })
        return res.status(200).json(newResponse);
    } catch (error) {
        return res.status(500).json({
            message : "Lỗi kết nối"
        });
    }
}

const updateUser = async (req,res) => {
    try {
        const userId = req.params.id;
        const data = req.body;
        if(!userId) {
            return res.status(404).json({
                status: "error",
                message: "Không tìm thấy người dùng"
            });
        }
        
        //Truyền req.body sang UserService gán vào newUser
        const response = await UserService.updateUser(userId,data);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            mesage: error
        });
    }
}

const deleteUser = async (req,res) => {
    try {
        const userId = req.params.id;
        if(!userId) {
            return res.status(404).json({
                status: "error",
                message: "Không tìm thấy người dùng"
            });
        }
        
        //Truyền req.body sang UserService gán vào newUser
        const response = await UserService.deleteUser(userId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            mesage: error
        });
    }
}

const getAllUser = async (req,res) => {
    try {
        //Truyền req.body sang UserService gán vào newUser
        const response = await UserService.getAllUser();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            mesage: error
        });
    }
}

const getDetailsUser = async (req,res) => {
    try {
        const userId = req.params.id;
        if(!userId) {
            return res.status(404).json({
                status: "error",
                message: "Không tìm thấy người dùng"
            });
        }
        
        //Truyền req.body sang UserService gán vào newUser
        const response = await UserService.getDetailsUser(userId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            mesage: error
        });
    }
}

const refreshToken = async (req,res) => {
    try {
        const token = req.cookies.refresh_token;
        if(!token) {
            return res.status(404).json({
                status: "error",
                message: "Token là bắt buộc"
            });
        }
        
        //Truyền req.body sang UserService gán vào newUser
        const response = await JwtService.refreshTokenJwtService(token);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            mesage: error
        });
    }
}

const logoutUser = async (req,res) => {
    try {
        res.clearCookie('refresh_token');
        return res.status(200).json({
            status: 'Ok',
            message: 'Đăng xuất thành công'
        });
    } catch (error) {
        return res.status(404).json({
            mesage: error
        });
    }
}

module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailsUser,
    refreshToken,
    logoutUser
};