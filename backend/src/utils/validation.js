const validator = require('validator');

const validateSignUpData = (req) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName) {
    throw new Error('First name is required');
  }
  if (!email) {
    throw new Error('Email is required');
  }
  if (!password) {
    throw new Error('Password is required');
  }
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email address');
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error(
      'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols'
    );
  }
};

const validateLoginData = (req) => {
  const { email, password } = req.body;
  if (!email) {
    throw new Error('Email is required');
  }
  if (!password) {
    throw new Error('Password is required');
  }
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email address');
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = ['age', 'gender', 'skills', 'photoURL', 'about'];
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validateLoginData,
  validateEditProfileData,
};
