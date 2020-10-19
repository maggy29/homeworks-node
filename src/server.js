const express = require("express");
const mongoose = require("mongoose");
const contactRouter = require("./contact/contactRouter");
const userRouter = require("./users/userRouter");

const PORT = 3001;
const DB_URL =
  "mongodb+srv://admin:oPYQytmGYGGvHAQC@cluster0.yu0up.mongodb.net/db-contacts";

module.exports = class ContactsServer {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddlewares();
    this.initRouters();
    await this.initDatabase();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(express.json());
  }

  initRouters() {
    this.server.use("/api/contacts", contactRouter);
    this.server.use("/api/users", userRouter);
    this.server.use(express.static("public"));
  }

  async initDatabase() {
    try {
      await mongoose.connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.info("Database connection successful");
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  startListening() {
    this.server.listen(PORT, (err) => {
      err ? console.error(err) : console.log("Server listening on port", PORT);
    });
  }
};
