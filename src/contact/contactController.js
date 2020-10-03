const Joi = require("joi");
const {
  Types: { ObjectId },
} = require("mongoose");
const contactModel = require("./contactModel");
const responseNormalizer = require("../normalizers/responseNormalizer");

class ContactController {
  async addContact(req, res, next) {
    const newContact = await contactModel.create(req.body);
    return res.status(201).json(responseNormalizer(newContact));
  }

  async getContacts(req, res, next) {
    const contacts = await contactModel.find();
    return res.status(200).json(responseNormalizer(contacts));
  }

  async getContactById(req, res, next) {
    const contactId = req.params.contactId;
    const contact = await contactModel.findById(contactId);

    if (!contact) {
      const error = new Error();
      error.message = "Not found";
      return res.status(404).send(responseNormalizer(error));
    }

    return res.status(200).json(responseNormalizer(contact));
  }

  async deleteContactById(req, res, next) {
    const contactId = req.params.contactId;
    const deletedContact = await contactModel.findByIdAndDelete(contactId);

    if (!deletedContact) {
      return res.status(404).send();
    }

    return res
      .status(200)
      .send(responseNormalizer({ message: "Contact deleted" }));
  }

  async updateContact(req, res, next) {
    const contactId = req.params.contactId;

    if (Object.keys(req.body).length === 0) {
      const error = new Error();
      error.message = "Missing fields";
      return res.status(400).send(responseNormalizer(error));
    }

    const updatedContact = await contactModel.findContactByIdAndUpdate(
      contactId,
      req.body
    );

    return res.status(200).json(responseNormalizer(updatedContact));
  }

  validateId(req, res, next) {
    const { contactId } = req.params;

    if (!ObjectId.isValid(contactId)) {
      return res.status(404).send(responseNormalizer({ message: "Not found" }));
    }

    next();
  }

  validateAddContact(req, res, next) {
    const Schema = Joi.object({
      name: Joi.string().min(3).required(),
      email: Joi.string().min(5).required(),
      phone: Joi.string().min(7).required(),
      subscription: Joi.string().min(3).required(),
      password: Joi.string().min(3).required(),
      token: Joi.string().required(),
    });

    const validation = Schema.validate(req.body);
    if (validation.error) {
      return res.status(400).send(responseNormalizer(validation.error));
    }

    next();
  }

  validateUpdateContact(req, res, next) {
    const Schema = Joi.object({
      name: Joi.string().min(3),
      email: Joi.string().min(5),
      phone: Joi.string().min(7),
      subscription: Joi.string().min(3),
      password: Joi.string().min(3),
      token: Joi.string(),
    });

    const validation = Schema.validate(req.body);
    if (validation.error) {
      return res.status(400).send(responseNormalizer(validation.error));
    }

    next();
  }
}

module.exports = new ContactController();
