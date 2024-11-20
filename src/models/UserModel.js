const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    phone: { type: Number },
    address: { type: String },
    avatar: {type: String},
    access_token: { type: String, required: false },
    refresh_token: { type: String, required: false },
    city: {type: String},
}, {
    timestamps: true  // Tự động thêm createdAt và updatedAt.
});

const User = mongoose.model("User", userSchema);
module.exports = User;
