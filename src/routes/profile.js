const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { validateEditProfileData } = require('../utils/validation');
const User = require('../models/user');

const profileRouter = express.Router();

profileRouter.get('/profile', userAuth, async (req, res) => {
  try {
    const user = req.user;
    const safeData = {
      firstName: user.firstName,
      lastName: user.lastName,
      photoURL: user.photoURL,
      skills: user.skills,
      about: user.about,
    };

    res.status(200).send(safeData);
  } catch (err) {
    res
      .status(500)
      .send({ message: 'Error fetching profile', error: err.message });
  }
});

profileRouter.delete('/user', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    res.cookie('token', null, { expires: new Date(Date.now()) });
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error deleting user', error: err });
  }
});

profileRouter.patch('/user/edit', userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error('Invalid Update Request');
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res.status(200).send({
      message: `${loggedInUser.firstName}, your profile updated successfully`,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: 'Error updating user', error: error.message });
  }
});

module.exports = profileRouter;
