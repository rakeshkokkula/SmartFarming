const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "mohiuddinrehan401@gmail.com",
    pass: "Ddjeelani12",
  },
});

module.exports = {
  transporter,
};
