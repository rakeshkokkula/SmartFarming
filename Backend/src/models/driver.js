const mongoose = require("mongoose");
//const file = require("./file").FileSchema;
const options = { discriminatorKey: "kind" };

const driverSchema = new mongoose.Schema(
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
    onGoingRideId: {
      type: mongoose.Schema.ObjectId,
      ref: "Ride",
      default: null,
    },
    online: {
      type: Boolean,
      default: false,
    },
    vehicle_name: String,
    max_load: String,
    vehicleNo: String,
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
const Driver = mongoose.model("Driver", driverSchema);

const drivertokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Driver",
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
  Driver: Driver,
  driverSchema: driverSchema,
  DriverToken: mongoose.model("DriverToken", drivertokenSchema),
};
