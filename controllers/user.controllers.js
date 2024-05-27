const { findUserBy, createUser, getOTP, verifyEmail, login, allUsers, delUser } = require("../servise/user.servise");
const { validateRegisterInput, validateEmail, validateLoginInput, validateUserName, validateUserMsg } = require("../validations/user.validations");
const { createVerificationEmail, sendMail } = require("../servise/email.servise");
const bcrypt = require("bcrypt");
const { get } = require("mongoose");

const registerUser = async (req, res) => {
    try {
        let data = req.body;
        const { error } = validateRegisterInput(data);

        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        const existingUser = await findUserBy("email", data.email);
        if (existingUser) {
            return res.status(400).send({ message: "Email already registered. Choose another email." });
        }

        const hashPassword = await bcrypt.hash(data.password, 10)

        data.password = hashPassword

        const newUser = await createUser(data);


        const OTP = await getOTP(newUser.email, "register");

        if (!OTP) {
            return res.status(400).send({ message: 'Error generating OTP.' });
        }

        const verificationEmail = createVerificationEmail(newUser.email, OTP);
        try{
            await sendMail(verificationEmail);
            return res.status(200).send({ message: "Success", email: newUser.email, OTP: OTP });
        }catch (error){
            return res.status(503).send({
                message: `Unable to send an email to ${newUser.email}. Please try again later.`,
            });
        }
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).send("Internal Server Error");
    }
};

const verifyUser = async (req, res) => {
    const { error } = validateEmail(req.body)
    if (error) return res.status(400).send({ message: error.details[0].message})

    const data = req.body

    try{
        const verified = await verifyEmail(data.email, data.OTP)
        if(!verified) return res.status(400).send({ message: 'Invalid OTP or Email!' });
        
        return res.status(200).send({ message: 'Success', verified });
    } catch (error) {
        return res.status(500).send("An unexpected error occurred");
    }
}

const loginUser = async (req, res) => {
    const { error } = validateLoginInput(req.body)
    if (error) return res.status(400).send({ message: error.details[0].message})

    const data = req.body

    try{
        const isLogin = await login(data.email, data.password)
        if(!isLogin) return res.status(400).send({ message: 'Invalid email or password' });

        return res.status(200).send({ message: 'Success', isLogin });
    } catch (error) {
        return res.status(500).send("An unexpected error occurred");
    }
}

const getAllUsers = async (req, res) => {
    const { error } = validateUserName(req.params);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const data = req.params.userName;
    try {
        const user = await findUserBy("userName", data);
        if (!user) return res.status(404).send({ message: "User not found" });

        const getUsers = await allUsers(user._id);
        
        return res.status(200).send({ message: "Success", getUsers });
    } catch (error) {
        console.error(error); // Log the actual error for debugging
        return res.status(500).send("An unexpected error occurred");
    }
};


const getSingleUser = async (req, res) => {
    const { error } = validateUserName(req.params);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const data = req.params;

    try {
        const getUser = await findUserBy("userName", data.userName);
        if (!getUser) return res.status(404).send({ message: "User not found" });

        return res.status(200).send({ message: "Success", getUser });
    } catch (error) {
        return res.status(500).send("An unexpected error occurred");
    }
};

const deleteUser = async (req, res) => {
    const { error } = validateUserName(req.params);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const data = req.params

    try{
        const getUser = await findUserBy("userName", data.userName);
        if (!getUser) return res.status(404).send({ message: "User not found" });

        const deleteUser = await delUser(data.userName)
        return res.status(200).send({ message: "Success", deleteUser });
    } catch (error) {
        return res.status(500).send("An unexpected error occurred");
    }

}

module.exports = {
    registerUser,
    loginUser,
    verifyUser,
    getAllUsers,
    getSingleUser,
    deleteUser,
};
