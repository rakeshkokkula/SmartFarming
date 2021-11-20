const router = require("express").Router();

const rideSchema = require("../../models/ride").Ride;

const createBookingDoc = (req) => {
  const {
    pickup_lat,
    pickup_lng,
    drop_lat,
    drop_lng,
    userId,
    kms,
    address,
    weight,
    fare,
    payment_type,
  } = req.body;
  console.log("DOC", req.body);
  const ride = new rideSchema({
    pickup_lat: pickup_lat,
    pickup_lng: pickup_lng,
    drop_lat: drop_lat,
    drop_lng: drop_lng,
    payment_type: payment_type,
    fare: fare,
    routes: [
      {
        _id: userId,
        state: "pickup",
        lat: pickup_lat,
        long: pickup_lng,
      },
      {
        _id: userId,
        state: "drop",
        lat: drop_lat,
        long: drop_lng,
      },
    ],
    customers: [
      {
        _id: userId,
        total_price: parseInt(kms) * 15 + parseInt(weight) * 10,
        kms: kms,
        address: address,
        weight: weight,
      },
    ],
  });
  return ride;
};

module.exports = {
  createBookingDoc: createBookingDoc,
};
