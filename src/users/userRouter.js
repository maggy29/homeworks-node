const { Router } = require("express");
const errorWrapper = require("../HOC/errorWrapper");
const userController = require("./userController");

const userRouter = Router();

userRouter.post(
  "/auth/register",
  userController.validateRegisterAndLogin,
  errorWrapper(userController.register)
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
  "/:userId/update-sub",
  userController.validateUserId,
  userController.updateSubscription
);
module.exports = userRouter;
