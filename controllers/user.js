const User = require("../models/user");
const bcrypt = require("bcryptjs");
const {
  validate,
  generateAuthToken,
  verifyToken,
} = require("../Middlewares/auth");

//controller for user register
exports.userRegister = async (req, reply) => {
  try {
    const checkValidationError = validate(req.body);
    if (checkValidationError)
      return reply.send({ status: "error", error: checkValidationError.err });
    const user = await User.findOne({ email: req.body.email });
    if (user)
      return reply.send({
        status: "error",
        error: "User with given email already Exist!",
      });
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const createUser = await new User({
      ...req.body,
      password: hashedPassword,
    }).save();
    if (createUser) console.log("User created successfully: ", createUser);
    return reply.send({ status: "ok", message: "User created successfully" });
  } catch (error) {
    console.log("Something went wrong", error);
    reply.send({ error: "Register Failed" });
  }
};

//controller for user login
exports.userLogin = async (req, reply) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return reply.send({ status: "error", error: "Invalid login" });
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid)
      return reply.send({ status: "error", error: "Invalid password" });
    const token = generateAuthToken(user);
    if (token) {
      console.log("User logged in successfully - ", user.username);
      return reply.send({ status: "ok", user: token });
    } else return res.json({ status: "error", user: false });
  } catch (error) {
    console.log("Something went wrong", error);
    reply.send({ error: "Login Failed" });
  }
};

exports.userDashboard = async (req, reply) => {
  try {
    const token =
      req.body.token || req.query.token || req.headers["x-access-token"];
    const verify = verifyToken(token);
    if (!verify.status)
      return reply.send({ status: "error", message: verify.err });
    // return reply.send({ status: "ok", message: "User authenticated successfully" });
  } catch (error) {
    console.log("Something went wrong", error);
    reply.send({ error: "Verification Failed" });
  }
};
