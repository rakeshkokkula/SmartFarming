const Ride = require("../../models/ride").Ride;
const Driver = require("../../models/driver").Driver;
const User = require("../../models/user").User;

module.exports = (socketio) => {
  socketio.on("connection", (socket) => {
    console.log("new Connection");
    socket.on("join", async (userId) => {
      if (userId !== null) {
        socket.join(userId);
        console.log("JOINED", socket.rooms);

        let driver = await Driver.exists({ _id: userId });
        if (driver) {
          await Driver.findByIdAndUpdate(
            { _id: userId },
            { online: true },
            { new: true }
          );
          socket.on("ride", async (rideId) => {
            let ride = await Ride.findById({ _id: rideId });
            console.log("UPDATE", ride);

            socket.on("update", async (lat, long) => {
              console.log("location", lat, long, ride);
              await Driver.findByIdAndUpdate(
                { _id: ride.driver_id },
                { lat: lat, long: long }
              );
            });
          });
          socket.on("disconnect", async () => {
            console.log("disconnect", userId);
            await Driver.findOneAndUpdate(
              { _id: userId },
              { online: false },
              { new: true }
            );
          });
        } else {
          let ride = await Ride.findOne({
            "customers._id": userId,
            "customers.isAccepted": true,
            "customers.isCompleted": false,
          }).populate("driver_id");
          if (ride) {
            console.log("user1 track", ride);
            socketio
              .to(userId.toString())
              .emit("track", ride.driver_id?.lat, ride.driver_id?.long);
          }
        }
      }
    });
  });
  socketio.on("disconnect", async (userId) => {
    console.log("disconnect");
    Driver.findOneAndUpdate({ _id: userId }, { online: false }, { new: true });
  });
};
