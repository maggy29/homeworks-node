require("dotenv").config();

module.exports = {
  tokenSecret: "secret",
  NODEMAILER_USER: process.env.NODEMAILER_USER,
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
};
