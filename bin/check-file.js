const mongoose = require('mongoose');


const Schema = mongoose.Schema;


const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },

    encryptedPassword: {
      type: String,
      required: true
    }
  },

  // optional settings object for this schema
  {
    // adds "createdAt" and "updatedAt" fields to the schema
    timestamps: true
  }
);

const UserModel = mongoose.model('User', userSchema);


module.exports = UserModel;
