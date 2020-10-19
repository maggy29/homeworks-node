const Joi = require("joi");
const {
  Types: { ObjectId },
} = require("mongoose");
const bcryptjs = require("bcryptjs");
const Avatar = require("avatar-builder");
const jwt = require("jsonwebtoken");
const userModel = require("./userModel");
const config = require("../config");
const path = require("path");
const fs = require("fs");
const moveFiles = require("../helpers/moveFiles");
const imagemin = require("../helpers/imagemin");
const generateFilename = require("../helpers/generateFilename");
const { min } = require("lodash");

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

    const avatar = Avatar.githubBuilder(128);

    avatar
      .create(email)
      .then((buffer) => fs.writeFileSync(`${email}.png`, buffer));

    await moveFiles(
      path.join(process.cwd(), `${email}.png`),
      path.join(process.cwd(), "public", "images", `${email}.png`)
    );

    const userInBase = await userModel.create({
      email,
      subscription,
      password: hashedPassword,
      avatarURL: `http://localhost:3001/images/${email}.png`,
    });

    const user = {
      email: userInBase.email,
      subscription: userInBase.subscription,
      avatarURL: `http://localhost:3001/images/${email}.png`,
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
  async updateSubscriptionOrAvatar(req, res, next) {
    const filepath = "public/images";
    const filename = generateFilename(req.file.mimetype);
    const minFilename = `min-${filename}`;
    const minImage = await imagemin(req.file.filename);

    await Promise.all([
      moveFiles(req.file.path, path.join(filepath, filename)),
      moveFiles(minImage[0].destinationPath, path.join(filepath, minFilename)),
    ]);

    const { subscription } = req.body;

    if (!["fre", "pro", "premium"].includes(subscription)) {
      const error = new Error();
      error.message = "Bad request";
      return res.status(400).send(error);
    }

    const userInBase = req.user;

    await userModel.findUserByIdAndUpdate(userInBase._id, {
      subscription,
      avatarURL: `http://localhost:3001/images/${filename}`,
    });

    // const user = {
    //   email: userInBase.email,
    //   subscription: userInBase.subscription,
    //   avatarURL: userInBase.avatarURL,
    // };

    return res
      .status(200)
      .sendFile(path.join(process.cwd(), "public", "images", minFilename));
    //.json({ user });
  }
  catch(error) {
    next(error);
  }
}

module.exports = new UserController();
