const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: String, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: true },
    description: { type: String, required: true },
    discount: { type: Number },
    selled: { type: Number },
},
    {
        timestamps: true, // Đặt trong tùy chọn schema
    }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
