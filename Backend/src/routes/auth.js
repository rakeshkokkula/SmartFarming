const router = require("express").Router();
const User = require("../models/user").User;
const Token = require("../models/user").Token;
const Driver = require("../models/driver").Driver;
const DriverToken = require("../models/driver").DriverToken;
const bcrypt = require("bcryptjs");
const jwtUtils = require("../utils/jwt");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const sendSms = require("twilio")(accountSid, authToken);

module.exports = (passport) => {
  const registerUser = async (req, res) => {
    try {
      const emailExists = await User.exists({ phoneNo: req.body.phone });
      //console.log(emailExists)
      if (emailExists)
        return res.status(409).json({ message: "phone no already in use" });
      // if (req.body.password !== req.body.password_confirmation) {
      //   return res.status(409).json({ message: "Passwords do not match" });
      // }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const newUser = new User({
        name: req.body.name,
        password: hash,
        confirmed: false,
        phoneNo: req.body.phone,
      });
      newUser.save();
      console.log("Registered" + newUser);
      const jwt = await jwtUtils.generateAuthJwt(newUser);
      const tokenArray = jwt.token.split(" ");
      const jwtToken = tokenArray[1];
      console.log(tokenArray, jwtToken);
      const token = new Token({
        _userId: newUser._id,
        token: jwtToken,
        code: Math.floor(1000 + Math.random() * 9000),
        expiresIn: jwt.expiresIn,
      });
      token.save();
      let sms = await sendSms.messages.create({
        body: `Verification OTP is ${token.code}`,
        from: "+14706256871",
        to: `+91${req.body.phone}`,
      });

      console.log("SMS sent", sms);

      return res.status(200).json({
        message: "User Successfully Registered",
      });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  };

  const registerDriver = async (req, res) => {
    try {
      const emailExists = await Driver.exists({ phoneNo: req.body.phone });
      //console.log(emailExists)
      if (emailExists)
        return res.status(409).json({ message: "Email already in use" });
      // if (req.body.password !== req.body.password_confirmation) {
      //   return res.status(409).json({ message: "Passwords do not match" });
      // }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const newUser = new Driver({
        name: req.body.name,
        password: hash,
        confirmed: false,
        phoneNo: req.body.phone,
      });
      newUser.save();
      console.log("Registered" + newUser);
      const jwt = await jwtUtils.generateAuthJwt(newUser);
      const tokenArray = jwt.token.split(" ");
      const jwtToken = tokenArray[1];
      console.log(tokenArray, jwtToken);
      const token = new DriverToken({
        _userId: newUser._id,
        token: jwtToken,
        code: Math.floor(1000 + Math.random() * 9000),
        expiresIn: jwt.expiresIn,
      });
      token.save();
      let sms = await sendSms.messages.create({
        body: `Verification OTP is ${token.code}`,
        from: "+14706256871",
        to: `+91${req.body.phone}`,
      });

      console.log("SMS sent", sms);

      return res.status(200).json({
        message: "Partner Successfully Registered",
      });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ message: err });
    }
  };

  const Userlogin = async (req, res) => {
    try {
      const user = await User.findOne({ phoneNo: req.body.phone });
      if (!user) return res.status(401).json({ message: "Invalid email" });

      const isValid = await bcrypt.compare(req.body.password, user.password);
      if (!isValid)
        return res.status(401).json({ message: "Invalid password" });
      const jwt = await jwtUtils.generateAuthJwt(user);
      const tokenArray = jwt.token.split(" ");
      const jwtToken = tokenArray[1];
      // const token = await Token.findOneAndUpdate(
      //   { _userId: user._id },
      //   {
      //     token: jwtToken,
      //     code: Math.floor(1000 + Math.random() * 9000),
      //     expiresIn: jwt.expiresIn,
      //   },
      //   { new: true }
      // );
      //token.save();
      // await sendSms.messages.create({
      //   body: `Verification OTP is ${token.code}`,
      //   from: "+14706256871",
      //   to: `+91${req.body.phone}`,
      // });
      // return res.status(200).json({
      //   message: "User Signed in Successfully ",
      // });
      return res.status(200).json({
        token: jwtToken,
        message: "User Signed in Successfully ",
        uid: user._id,
        expiresIn: jwt.expiresIn,
        user: user,
        role: "user",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
  };

  const Driverlogin = async (req, res) => {
    try {
      //console.log(req.body)
      const user = await Driver.findOne({ phoneNo: req.body.phone });
      console.log(user);
      if (!user) return res.status(401).json({ message: "Invalid email" });

      const isValid = await bcrypt.compare(req.body.password, user.password);
      if (!isValid)
        return res.status(401).json({ message: "Invalid password" });
      const jwt = await jwtUtils.generateAuthJwt(user);
      const tokenArray = jwt.token.split(" ");
      const jwtToken = tokenArray[1];
      // const token = await DriverToken.findOneAndUpdate(
      //   { _userId: user._id },
      //   {
      //     token: jwtToken,
      //     code: Math.floor(1000 + Math.random() * 9000),
      //     expiresIn: jwt.expiresIn,
      //   },
      //   { new: true }
      // );
      // console.log(token);
      // await sendSms.messages.create({
      //   body: `Verification OTP is ${token.code}`,
      //   from: "+14706256871",
      //   to: `+91${req.body.phone}`,
      // });
      // console.log(token.token);
      // return res.status(200).json({
      //   message: "Driver Signed in Successfully ",
      // });
      // let driver = await Driver.findOne({ _id: user._id }).select(
      //   "name phoneNo"
      // );
      // return res.status(200).redirect('http://localhost:3000/createWorkspace');
      return res.status(200).json({
        token: jwtToken,
        message: "Driver Signed in Successfully ",
        uid: user._id,
        expiresIn: jwt.expiresIn,
        user: user,
        role: "driver",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
  };

  const Userconfirmation = async (req, res) => {
    try {
      let token = await Token.findOneAndUpdate(
        { code: req.query.code },
        { code: null }
      );
      // console.log(token, req.query.code);
      let user = await User.findOne({ _id: token._userId }).select(
        "name phoneNo"
      );
      // return res.status(200).redirect('http://localhost:3000/createWorkspace');
      return res.status(200).json({
        token: token.token,
        message: "User Signed in Successfully ",
        uid: token._userId,
        expiresIn: token.expiresIn,
        user: user,
        role: "user",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
  };

  const Driverconfirmation = async (req, res) => {
    try {
      let token = await DriverToken.findOneAndUpdate(
        { code: req.query.code },
        { code: null }
      );
      userId = token._userId;
      if (!userId) {
        // console.log('Invalid token');
        return res.status(400).json({ message: "Invalid token" });
      }
      let driver = await Driver.findOne({ _id: token._userId }).select(
        "name phoneNo"
      );
      // return res.status(200).redirect('http://localhost:3000/createWorkspace');
      return res.status(200).json({
        token: token.token,
        message: "Driver Signed in Successfully ",
        uid: token._userId,
        expiresIn: token.expiresIn,
        user: driver,
        role: "driver",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
  };

  router.post("/user/register", registerUser);
  router.post("/driver/register", registerDriver);
  router.get("/user/confirmation", Userconfirmation);
  router.get("/driver/confirmation", Driverconfirmation);
  router.post("/user/login", Userlogin);
  router.post("/driver/login", Driverlogin);

  return router;
};
