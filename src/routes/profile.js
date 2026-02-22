const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { validateEditProfileData } = require('../utils/validation');
const User = require('../models/user');

const profileRouter = express.Router();

profileRouter.get('/profile/view', userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { password, __v, createdAt, updatedAt, ...safeData } =
      user.toObject();

    res.status(200).send(safeData);
  } catch (err) {
    res
      .status(500)
      .send({ message: 'Error fetching profile', error: err.message });
  }
});

profileRouter.delete('/profile/remove', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    res.cookie('token', null, { expires: new Date(Date.now()) });
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error deleting user', error: err });
  }
});

profileRouter.patch('/profile/update', userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error('Invalid Update Request');
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    const { password, __v, createdAt, updatedAt, ...safeData } =
      loggedInUser.toObject();
    res.status(200).send({
      message: `${safeData.firstName}, your profile updated successfully`,
      data: safeData,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: 'Error updating user', error: error.message });
  }
});

module.exports = profileRouter;
