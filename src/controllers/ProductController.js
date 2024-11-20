const ProductService = require('../services/ProductService');

const createProduct = async (req,res) => {
    try {
        const {name, image, type, price, countInStock,rating,description, discount} = req.body;
        console.log('req.body', req.body);
        if(!name || !image || !type || !price || !countInStock || !rating || !description || !discount) {
            return res.status(500).json({
                status: "error",
                message: "Các trường dữ liệu là bắt buộc"
            });
        }
        //Truyền req.body sang UserService gán vào newUser
        const response = await ProductService.createProduct(req.body);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            mesage: error
        });
    }
}

const updateProduct = async (req,res) => {
    try {
        const productId = req.params.id;
        console.log("productId", productId);
        
        const data = req.body;
        if(!productId) {
            return res.status(404).json({
                status: "error",
                message: "Không tìm thấy sản phẩm"
            });
        }
        
        //Truyền req.body sang UserService gán vào newUser
        const response = await ProductService.updateProduct(productId,data);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            mesage: error
        });
    }
}

const deleteProduct = async (req,res) => {
    try {
        const productId = req.params.id;
        if(!productId) {
            return res.status(404).json({
                status: "error",
                message: "Không tìm thấy sản phẩm"
            });
        }
        
        //Truyền req.body sang UserService gán vào newUser
        const response = await ProductService.deleteProduct(productId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            mesage: error
        });
    }
}

const getAllProduct = async (req,res) => {
    try {
        const {limit,page, sort, filter} = req.query;
        //Truyền req.body sang UserService gán vào newUser
        const response = await ProductService.getAllProduct(Number(limit) || 8,Number(page) || 0 , sort , filter);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Lỗi", error);
        
        
        return res.status(404).json({
            mesage: error
        });
    }
}

const getDetailProduct = async (req,res) => {
    try {
        const productId = req.params.id;
        if(!productId) {
            return res.status(404).json({
                status: "error",
                message: "Không tìm thấy sản phẩm"
            });
        }
        
        //Truyền req.body sang UserService gán vào newUser
        const response = await ProductService.getDetailProduct(productId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            mesage: error
        });
    }
}

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getDetailProduct,
    getAllProduct
};