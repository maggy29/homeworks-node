const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String },
  password: { type: String },
  avatarURL: { type: String },
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  token: { type: String },
});

userSchema.statics.findUserByIdAndUpdate = findUserByIdAndUpdate;
userSchema.statics.updateToken = updateToken;

async function updateToken(id, newToken) {
  return this.findByIdAndUpdate(id, { token: newToken });
}
async function findUserByIdAndUpdate(userId, updateParams) {
  return this.findByIdAndUpdate(userId, { $set: updateParams }, { new: true });
}

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
