const { Router } = require("express");
const errorWrapper = require("../HOC/errorWrapper");
const userController = require("./userController");
const upload = require("../helpers/multer");

const userRouter = Router();

userRouter.post(
  "/auth/register",
  userController.validateRegisterAndLogin,
  userController.register
);

userRouter.post(
  "/auth/login",
  userController.validateRegisterAndLogin,
  errorWrapper(userController.login)
);
userRouter.post(
  "/auth/logout",
  errorWrapper(userController.authorize),
  errorWrapper(userController.logout)
);
userRouter.get(
  "/current",
  errorWrapper(userController.authorize),
  errorWrapper(userController.getCurrent)
);
userRouter.patch(
  "/avatars",
  upload.single("avatar"),
  errorWrapper(userController.authorize),
  errorWrapper(userController.updateSubscriptionOrAvatar)
);

module.exports = userRouter;
