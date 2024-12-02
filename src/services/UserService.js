const User = require('../models/UserModel');
const bcrypt = require('bcryptjs'); // Thay đổi từ bcrypt sang bcryptjs
const jwt = require('jsonwebtoken');
const { genneralAccessToken,genneralRefreshToken } = require('./JwtService');

const createUser = (newUser) => {
    return new Promise(async(resolve,reject) => {
        try {
            const {name, email, password, confirmPassword, phone} = newUser;
            const checkUser = await User.findOne({
                email: email
            });
            if(checkUser !== null) {
                resolve({
                    status: 'error',
                    message: "Email đã tồn tại, hãy nhập email khác"
                })
            }

            const hash = bcrypt.hashSync(password,10);
            const createdUser = await User.create({
                name, 
                email, 
                password: hash,
                phone
            });
            if(createdUser) {
                resolve({
                    status: "200",
                    message: "Tạo thành công User mới",
                    data: createdUser
                })
            } 
        } catch (error) {
            reject(error);
        }
    })
}

const loginUser = (userLogin) => {
    return new Promise(async(resolve,reject) => {
        try {
            const {email, password} = userLogin;
            const checkUser = await User.findOne({
                email: email
            });
            
            if(checkUser === null) {
                return resolve({
                    status: 'error',
                    message: "Email chưa tồn tại. Hãy tạo mới 1 tài khoản"
                });
            }

            const comparePassword = bcrypt.compareSync(password, checkUser.password);
            if(!comparePassword) {
                return resolve({
                    status: 'error',
                    message: "Sai mật khẩu"
                })
            }
            const access_token = await genneralAccessToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })
            const refresh_token = await genneralRefreshToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })
            resolve({
                status: 200,
                message: "Đăng nhập thành công",
                data: checkUser,
                access_token,
                refresh_token
            })
        } catch (error) {
            console.error('Login Error:', error);
            reject(error);
        }
    })
}

const updateUser = (id, data) => {
    return new Promise(async(resolve,reject) => {
        try {
            const checkUser = await User.findOne({
                _id: id
            });
            
            if(checkUser === null) {
                resolve({
                    status: 500,
                    message: "Email chưa tồn tại. Hãy tạo mới 1 tài khoản"
                })
            }
            const updatedUser = await User.findByIdAndUpdate(id, data, {new:true})
            resolve({
                status: 200,
                message: "Đổi thông tin thành công",
                data: updatedUser
            })
        } catch (error) {
            reject(error);
        }
    })
}

const deleteUser = (id) => {
    return new Promise(async(resolve,reject) => {
        try {
            const checkUser = await User.findOne({
                _id: id
            });
            
            if(checkUser === null) {
                resolve({
                    status: 500,
                    message: "Không tìm thấy user để xóa"
                })
            }
            await User.findByIdAndDelete(id)
            resolve({
                status: 200,
                message: "Xóa user thành công"
            })
        } catch (error) {
            console.error("Delete error", error);
            reject(error);
        }
    })
}

const getAllUser = () => {
    return new Promise(async(resolve,reject) => {
        try {
            const allUser = await User.find();
            resolve({
                status: 200,
                message: "Lấy thành công danh sách user",
                data: allUser
            })
        } catch (error) {
            reject(error);
        }
    })
}

const getDetailsUser = (id) => {
    return new Promise(async(resolve,reject) => {
        try {
            const user = await User.findOne({
                _id: id
            });
            
            if(user === null) {
                resolve({
                    status: 404,
                    message: "Không có user trong database"
                })
            }
            resolve({
                status: 200,
                message: "Lấy thông tin thành công",
                data: user
            })
        } catch (error) {
            reject(error);
        }
    })
}


module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailsUser
};