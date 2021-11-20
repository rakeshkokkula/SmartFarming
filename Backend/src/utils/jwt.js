const jwt = require("jsonwebtoken");
const { model } = require("mongoose");
const { User } = require("../models/user");
const { Driver } = require("../models/driver");

const generateAuthJwt = async (user) => {
  const expire = "10d";
  const payload = {
    uid: user._id,
    name: user.name,
    email: user.email,
    iat: Date.now(),
  };
  const signedToken = await jwt.sign(payload, process.env.AUTH_SECRET, {
    expiresIn: expire,
  });
  return {
    token: "Bearer " + signedToken,
    expiresIn: expire,
  };
};

const verifyJwtInUser = async (req, res, next) => {
  try {
    const bearerToken = req.headers["authorization"];

    if (bearerToken) {
      const tokenArray = bearerToken.split(" ");
      const token = tokenArray[1];
      const userId = await jwt.verify(token, process.env.AUTH_SECRET);
      if (userId) {
        const userExists = await User.exists({
          _id: userId.uid,
        });
        const driverExists = await Driver.exists({
          _id: userId.uid,
        });
        if (userExists || driverExists) {
          next();
        } else {
          res.status(403).json({
            message: "No User exists with given token",
          });
        }
      }
    } else {
      res.status(403).json({
        message: "no token recieved",
      });
    }
  } catch (error) {
    res.status(403).json({
      message: error,
    });
  }
};

module.exports = {
  generateAuthJwt: generateAuthJwt,
  verifyJwtInUser: verifyJwtInUser,
};
