const { createBookingDoc } = require("./controller");
const Driver = require("../../models/driver").Driver;
const Ride = require("../../models/ride").Ride;
const User = require("../../models/user").User;
const router = require("express").Router();
const turf = require("@turf/turf");
const ObjectID = require("mongodb").ObjectID;

module.exports = (socketio) => {
  const createBooking = async (req, res) => {
    console.log("BODY", req.body);
    const {
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng,
      userId,
      kms,
      address,
      weight,
    } = req.body;
    let locations = [[], []];
    if (parseFloat(pickup_lat) < 18 && parseFloat(pickup_lng) < 79) {
      //console.log(turf);
      var targetPoint = turf.point(
        [parseFloat(pickup_lat), parseFloat(pickup_lng)],
        {
          "marker-color": "#0F0",
        }
      );
      Driver.find({ online: true }, async (err, drivers) => {
        drivers.forEach((driver) => {
          //console.log(driver);
          let { lat, long } = driver;
          locations[0].push(driver);
          locations[1].push(turf.point([parseFloat(lat), parseFloat(long)]));
        });
        var points = turf.featureCollection(locations[1]);

        var nearest = turf.nearestPoint(targetPoint, points);
        let rideExists = await Ride.exists({
          _id: locations[0][nearest.properties.featureIndex].onGoingRideId,
        });
        console.log(locations[0][nearest.properties.featureIndex], rideExists);

        if (
          rideExists &&
          locations[0][nearest.properties.featureIndex].online
        ) {
          console.log(
            "Ongoing ride",
            locations[0][nearest.properties.featureIndex]
          );
          let ride = locations[0][nearest.properties.featureIndex];

          Ride.findByIdAndUpdate(
            { _id: ride.onGoingRideId },
            {
              $push: {
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
              },
            },
            { new: true }
          ).then((ride, err) => {
            socketio.to(ride.driver_id.toString()).emit("allot", ride);
            res.json({
              message: "success",
            });
          });
        } else {
          console.log("new ride", nearest);
          let ride = createBookingDoc(req);

          ride.driver_id = locations[0][nearest.properties.featureIndex]._id;
          socketio.to(ride.driver_id.toString()).emit("allot", ride);
          ride.save();
          res.json({
            message: "success",
          });
        }
      });
    } else {
      console.log("OUT OF HYD");
      res.status(500).json({
        error: "Out Of Hyderabad",
      });
    }
  };

  const trackRide = (req, res) => {
    const { userId } = req.query;
    console.log("TRACKKK", userId);
    Ride.findOne({
      customers: {
        $elemMatch: {
          _id: userId,
          isRejected: false,
          isCompleted: false,
          isAccepted: true,
        },
      },
    })
      .populate("driver_id")
      .then((err, ride) => {
        console.log("user", err, ride);

        if (err) res.send(err);
        if (ride) {
          res.send(ride);
        }
      });
  };

  const getRideForDriver = async (req, res) => {
    const { driverId } = req.query;
    console.log(driverId);
    Ride.findOne({
      driver_id: ObjectID(driverId),
      customers: {
        $elemMatch: {
          isRejected: false,
          isCompleted: false,
        },
      },
    })
      .populate("customers._id")
      .exec((err, ride) => {
        console.log("DRIVER", ride, err);
        if (err) res.send(err);
        if (ride === null) res.status(500).send("no rides");
        else res.send(ride);
      });
  };

  const rideDecide = (req, res) => {
    const { rideId, userId, accept, driverId } = req.body;
    console.log("RIDE DECIDE", req.body);
    Driver.findOneAndUpdate(
      { _id: driverId },
      { onGoingRideId: rideId },
      { new: true }
    ).then((err, ride) => console.log(ride, err));
    if (accept) {
      Ride.findOneAndUpdate(
        { _id: rideId, "customers._id": userId },
        {
          $set: {
            "customers.$.isAccepted": true,
            "customers.$.isRejected": false,
          },
        },
        { new: true }
      ).then((ride, err) => {
        socketio.to(userId.toString()).emit("accepted", { message: ride });
        console.log(err, ride);
        if (err) {
          res.send(err);
        }
        res.send(ride);
      });
    } else if (accept === false) {
      Ride.findOneAndUpdate(
        { _id: rideId, "customers._id": userId },
        {
          $set: {
            "customers.$.isAccepted": false,
            "customers.$.isRejected": true,
          },
        },
        { new: true }
      ).then((ride, err) => {
        console.log(ride, err);
        socketio.to(userId.toString()).emit("accepted", { message: ride });
        //console.log(err, ride);
        if (err) {
          res.send(err);
        }
        res.send(ride);
      });
    } else {
      socketio
        .to(userId.toString())
        .emit("rejected", { message: "No vehicles" });
      res.json({
        message: "no cabs available",
      });
    }
  };

  const getNearByRides = (req, res) => {
    let { lat, long } = req.query;
    lat = parseFloat(lat);
    long = parseFloat(long);
    let locations = [[], []];
    let nearest = null;
    var targetPoint = turf.point([parseFloat(lat), parseFloat(long)], {
      "marker-color": "#0F0",
    });
    Driver.find({ online: true }, (err, drivers) => {
      //console.log(drivers);
      drivers.forEach((driver) => {
        let { lat, long } = driver;
        locations[0].push(driver);
        locations[1].push(turf.point([parseFloat(lat), parseFloat(long)]));
        var points = turf.featureCollection(locations[1]);

        nearest = turf.nearestPoint(targetPoint, points);
        //console.log("NearBy", locations[0][nearest.properties.featureIndex]);
      });

      if (err) {
        res.status(500).json({
          nearestPoints: "no nearby",
        });
      } else {
        res.status(200).json({
          nearestPoints: nearest.geometry.coordinates,
        });
      }
    });
  };

  const completeRide = async (req, res) => {
    let { rideId, userId, last } = req.body;
    console.log(req.body);
    let ride = await Ride.findOneAndUpdate(
      { _id: rideId, "customers._id": userId },
      { $set: { "customers.$.isCompleted": true } },
      { new: true }
    );
    if (last) {
      Driver.findOneAndUpdate(
        { onGoingRideId: rideId },
        { onGoingRideId: null }
      );
    }
    if (ride) {
      console.log(ride);
      res.send(ride);
    } else res.json({ error: "error" });

    // User.findByIdAndUpdate(
    //   { _id: userId },
    //   { $push: { previousRides: { _id: rideId } } }
    // );
    // ride.weight = parseInt(ride.weight) * 10;
    // ride.fare = parseInt(ride.fare);
    // if (extraKms) ride.total = ride.fare * (kmsCovered + extraKms);
    // else ride.total = ride.fare * kmsCovered;
    // ride.total =
    //   ride.weight + parseInt(ride.total) + parseInt(parseInt(ride.total) * 0.2);
    // ride.isCompleted = true;
    // ride.save().then((err, ride) => {
    //   if (err) res.send(err);
    //   else {
    //     socketio.to(ride.user_id.toString()).emit("completed", ride);
    //     res.send(ride);
    //   }
    // });
  };
  const checkRideStatus = (req, res) => {
    const { userId } = req.query;
    Ride.findOne({
      "customers._id": userId,
      "customers.isAccepted": false,
    }).then(
      (err) => res.send(err),
      (ride) => res.send(ride)
    );
  };
  const closetheRide = async (req, res) => {
    const { driverId } = req.query;
    console.log("CLOSE RIDE", req.query);
    await Ride.findOneAndUpdate(
      { driver_id: driverId },
      { isCompleted: false, driver_id: null },
      { new: true }
    );
    Driver.findOneAndUpdate(
      { _id: driverId },
      { onGoingRideId: null },
      { new: true }
    ).then((err, ride) => {
      // console.log(err);
      if (err) res.send(err);
      else res.send(ride);
    });
  };
  router.post("/book", createBooking);
  router.patch("/completeRide", completeRide);
  router.patch("/decideRide", rideDecide);
  router.get("/getNearby", getNearByRides);
  router.get("/track", trackRide);
  router.get("/status", checkRideStatus);
  router.get("/rides/driver", getRideForDriver);
  router.patch("/closeRide", closetheRide);
  return router;
};
