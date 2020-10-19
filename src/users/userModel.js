const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String },
  password: { type: String },
  avatarURL: { type: String },
  status: {
    type: String,
    requierd: true,
    enum: ["Verified", "Created"],
    default: "Created",
  },
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  verificationToken: { type: String, required: false },
  token: { type: String },
});

userSchema.statics.findUserByIdAndUpdate = findUserByIdAndUpdate;
userSchema.statics.updateToken = updateToken;
userSchema.statics.createVerificationToken = createVerificationToken;
userSchema.statics.findByVerificationToken = findByVerificationToken;
userSchema.statics.verifyUser = verifyUser;

async function updateToken(id, newToken) {
  return this.findByIdAndUpdate(id, { token: newToken });
}
async function findUserByIdAndUpdate(userId, updateParams) {
  return this.findByIdAndUpdate(userId, { $set: updateParams }, { new: true });
}
async function createVerificationToken(userId, verificationToken) {
  return this.findByIdAndUpdate(userId, { verificationToken }, { new: true });
}
async function findByVerificationToken(verificationToken) {
  return this.findOne({ verificationToken });
}
async function verifyUser(userId) {
  return this.findByIdAndUpdate(
    userId,
    { status: "Verified", verificationToken: null },
    { new: true }
  );
}

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
