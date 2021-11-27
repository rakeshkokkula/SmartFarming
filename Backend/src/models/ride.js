const mongoose = require("mongoose");

const rideSchema = mongoose.Schema({
  drop_lat: String,
  drop_lng: String,
  pickup_lat: String,
  pickup_lng: String,
  category: String,
  pickup_mode: String,
  payment_type: String,
  weight: String,
  fare: String,
  coupon_code: String,
  affiliate_uid: String,
  merchant_txn_id: String,
  kmsEstimated: String,
  isRideAccepted: {
    type: Boolean,
    default: false,
  },
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  driver_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Driver",
  },
  customers: [
    {
      _id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      kms: String,
      total_price: String,
      isCompleted: {
        type: Boolean,
        default: false,
      },
      isRejected: {
        type: Boolean,
        default: false,
      },
      isAccepted: {
        type: Boolean,
        default: false,
      },
      address: String,
      weight: String,
      paymentStatus: String,
      paymentId: String,
    },
  ],
  routes: [
    {
      _id: mongoose.Schema.ObjectId,
      state: String,
      lat: String,
      long: String,
      kms: String,
    },
  ],
  total: String,
  kmsCovered: String,
  extraKms: String,
});
const Ride = mongoose.model("Ride", rideSchema);

module.exports = {
  rideSchema: rideSchema,
  Ride: Ride,
};
