const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
        userName:{
            type: String,
            minlength: 1,
            maxlength: 255,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            minlength: 5,
            maxlength: 255,
            unique: true,
        },
        password:{
            type: String,
            minlength: 8,
            maxlength: 1024,
            required: true,
            unique: true,
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false,
        },
        messages: [{
            sender: String,
            content: String,
            timestamp: { type: Date, default: Date.now }
        }],
    },
    {
        timestamps: true
    }
)

const Users = mongoose.model("Users", userSchema)

module.exports = Users