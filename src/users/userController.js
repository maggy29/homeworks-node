const Joi = require("joi");
const {
  Types: { ObjectId },
} = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("./userModel");
const config = require("../config");

class UserController {
  constructor() {
    this._costFactor = 4;
  }
  get register() {
    return this._register.bind(this);
  }
  validateRegisterAndLogin(req, res, next) {
    const schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
      subscription: Joi.string(),
    });

    const validation = schema.validate(req.body);
    if (validation.error) {
      const error = new Error();
      error.message = validation.error;
      return res.status(400).send(error);
    }

    next();
  }
  validateUserId(req, res, next) {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).send();
    }
    next();
  }
  async _register(req, res, next) {
    const { email, password, subscription } = req.body;
    const isUserExist = await userModel.findOne({ email });

    if (isUserExist) {
      const error = new Error();
      error.message = "Email in use";
      return res.status(409).send(error);
    }

    const hashedPassword = await bcryptjs.hash(password, this._costFactor);

    const userInBase = await userModel.create({
      email,
      subscription,
      password: hashedPassword,
    });

    const user = {
      email: userInBase.email,
      subscription: userInBase.subscription,
    };

    res.status(201).send({ user });
  }
  async login(req, res, next) {
    const { email, password } = req.body;
    const userInBase = await userModel.findOne({ email });
    if (!userInBase) {
      const error = new Error();
      error.message = "Email or password is wrong";
      return res.status(401).send(error);
    }
    const isPasswordValid = await bcryptjs.compare(
      password,
      userInBase.password
    );
    if (!isPasswordValid) {
      const error = new Error();
      error.message = "Email or password is wrong";
      return res.status(401).send(error);
    }
    const token = await jwt.sign({ _id: userInBase._id }, config.tokenSecret);
    await userModel.updateToken(userInBase._id, token);
    const user = {
      email: userInBase.email,
      subscription: userInBase.subscription,
    };

    return res.status(200).json({ token, user });
  }
  async authorize(req, res, next) {
    try {
      const authorizationHeader = req.get("Authorization") || "";
      const token = authorizationHeader.split(" ")[1];

      let userId;
      try {
        userId = await jwt.verify(token, config.tokenSecret)._id;
      } catch (err) {
        const error = new Error();
        error.message = "Not authorized";
        return res.status(401).send(error);
      }

      const userInBase = await userModel.findById(userId);
      if (!userInBase || userInBase.token !== token) {
        const error = new Error();
        error.message = "Not authorized";
        return res.status(401).send(error);
      }

      req.user = userInBase;
      req.token = token;

      next();
    } catch (error) {
      next(error);
    }
  }
  async logout(req, res, next) {
    try {
      const userInBase = req.user;
      await userModel.updateToken(userInBase._id, null);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
  async getCurrent(req, res, next) {
    const [user] = [req.user];
    return res
      .status(200)
      .json({ email: user.email, subscription: user.subscription });
  }
  async updateSubscription(req, res, next) {
    try {
      const userId = req.params.userId;
      const { subscription } = req.body;

      if (!["fre", "pro", "premium"].includes(subscription)) {
        const error = new Error();
        error.message = "Bad request";
        return res.status(400).send(error);
      }
      const updatedUser = await userModel.findUserByIdAndUpdate(userId, {
        subscription,
      });

      if (!updatedUser) {
        const error = new Error();
        error.message = "Not Found";
        return res.status(404).send(error);
      }
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
