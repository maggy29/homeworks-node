const { Router } = require("express");
const contactController = require("./contactController");
const errorWrapper = require("../HOC/errorWrapper");

const contactRouter = Router();

contactRouter.post(
  "/",
  contactController.validateAddContact,
  errorWrapper(contactController.addContact)
);
contactRouter.get("/", errorWrapper(contactController.getContacts));
contactRouter.get(
  "/:contactId",
  contactController.validateId,
  errorWrapper(contactController.getContactById)
);
contactRouter.delete(
  "/:contactId",
  contactController.validateId,
  errorWrapper(contactController.deleteContactById)
);
contactRouter.put(
  "/:contactId",
  contactController.validateId,
  contactController.validateUpdateContact,
  errorWrapper(contactController.updateContact)
);

module.exports = contactRouter;
