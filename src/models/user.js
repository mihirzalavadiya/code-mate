const mongoose = require('mongoose');
const validator = require('validator');
const bycrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
      trim: true,
    },
    lastName: {
      type: String,
      maxLength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email address');
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password cannot contain the word "password"');
        }
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols'
          );
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    gender: {
      type: String,
      lowercase: true,
      enum: {
        values: ['male', 'female', 'others'],
        message: '{VALUE} is not a valid gender type',
      },
    },
    skills: {
      type: [String],
      validate(value) {
        if (value.length > 10) {
          throw new Error('Skills cannot be more than 10');
        }
      },
    },
    photoURL: {
      type: String,
      default:
        'https://www.citypng.com/photo/21035/hd-man-user-illustration-icon-transparent-png',
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error('Invalid URL for photo');
        }
      },
    },
    about: {
      type: String,
      maxLength: 300,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const isPasswordValid = await bycrypt.compare(
    passwordInputByUser,
    this.password
  );
  return isPasswordValid;
};

module.exports = mongoose.model('User', userSchema);
