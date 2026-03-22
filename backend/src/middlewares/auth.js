const jwt = require('jsonwebtoken');
const User = require('../models/user');

const adminAuth = (req, res, next) => {
  const token = 'xyz';
  const isAdminAuthenticated = token === 'xyz'; // Simulate authentication check
  if (isAdminAuthenticated) {
    next();
  } else {
    res.status(401).send({ message: 'Unauthorized' });
  }
};

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error('Token is not valid! Please Login again.');
    }
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedObj;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error('User does not exist');
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send('ERROR: ' + err.message);
  }
};

module.exports = {
  adminAuth,
  userAuth,
};
