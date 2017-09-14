const mongoose = require('mongoose');


const Schema = mongoose.Schema;


const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    // we are going to have three type of users
    encryptedPassword: {type: String},

    facebookID:        {type: String},

    googleID:          {type: String},

    // determines whether you are an admin or Not
    role: {
      type: String,
      enum: ['normal', 'admin'],
      default: 'normal'
    }
  },
  // optional settings object for this schema
  {
    //adds 'createdAt' and 'UpdatedAt' to the Schema
    timestamps: true
  }
);

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
