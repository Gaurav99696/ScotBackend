const Users = require("../models/user.model");
require("dotenv").config();
const OTP = require("../models/OTP.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const findUserBy = async (prop, value) => Users.findOne({ [prop]: value });

const createUser = async ({ email, userName, password }) => {
  return await Users.create({ userName, email, password });
};

const getOTP = async (email, purpose) => {
  const user = await Users.findOne({ email });
  if (!user) false;

  const exist = await OTP.findOne({ email, for: purpose });
  if (exist) false;

  return await OTP.create({ OTP: getCode(), for: purpose, email });
};

const verifyEmail = async (email, otp) => {
  const verified = await OTP.findOne({ email, OTP: otp, for: "register" });
  if (!verified) return false;

  const user = await Users.findOneAndUpdate({ email }, { isVerified: true });

  const data = {
    email: user.email,
    id: user._id,
  };

  const deleteOTP = await OTP.findOneAndDelete({
    email,
    OTP: otp,
    for: "register",
  });

  return {
    user,
    Authorization: await getToken(data),
  };
};

const login = async (email, password) => {
  let data = await Users.findOne({ email, isVerified: true });

  const comparePassword = await bcrypt.compare(password, data.password);

  if (!comparePassword) return false;

  const tokenData = {
    email: data?.email,
    id: data?._id,
  };

  return {
    data,
    Authorization: await getToken(tokenData),
  };
};

const allUsers = async (id) => await Users.find({ _id: { $ne: id } })

const delUser = async (userName) => await Users.deleteOne({ userName: userName })

let getToken = async (body) =>
  await jwt.sign(body, process.env.JWT_SECRET || "", {
    expiresIn: process.env.JWT_EXPIRY,
  });

let getCode = () =>
  Math.floor(Math.random() * (9 * Math.pow(10, 4 - 1))) + Math.pow(10, 4 - 1);

module.exports = {
  findUserBy,
  createUser,
  getOTP,
  verifyEmail,
  login,
  allUsers,
  delUser,
};
