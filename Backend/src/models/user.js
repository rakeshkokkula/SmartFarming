const mongoose = require("mongoose");
//const file = require("./file").FileSchema;
const options = { discriminatorKey: "kind" };

const userSchema = new mongoose.Schema(
  {
    email: String,
    name: String,
    phoneNo: {
      type: String,
      required: true,
    },
    password: String,
    googleID: String,
    photoUrl: String,
    confirmed: {
      type: Boolean,
      default: false,
    },
    status: Boolean, //user online offline
    latestActivity: String,
    socket_id: String,
    bio: String,
    previousRides: [
      {
        _id: {
          type: mongoose.Schema.ObjectId,
          ref: "Rides",
        },
      },
    ],
    lat: String,
    long: String,
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

const tokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresIn: String,
});

module.exports = {
  User: User,
  userSchema: userSchema,
  Token: mongoose.model("Token", tokenSchema),
};
