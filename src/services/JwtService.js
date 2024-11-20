const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const genneralAccessToken = async (payload) => {
    const access_token = jwt.sign(
        payload, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '30s' }
    );
    return access_token;
}

const genneralRefreshToken = async (payload) => {
    const refresh_token = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '365d' }
    );
    return refresh_token;
}

const refreshTokenJwtService = (token) => {
    return new Promise((resolve,reject) => {
        try {
            jwt.verify(token,process.env.REFRESH_TOKEN_SECRET, async (err,user) => {
                if(err) {
                    reject({
                        status: "error",
                        message: "The authentication"
                    })
                }
                
                const access_token = await genneralAccessToken({
                    id: user?.id,
                    isAdmin: user?.isAdmin
                });
                console.log(access_token);
                resolve({
                    status: 200,
                    message: "Lấy thông tin thành công",
                    access_token
                })
            })
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    genneralAccessToken,
    genneralRefreshToken,
    refreshTokenJwtService
};
