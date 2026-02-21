const express = require('express');
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');

const userRouter = express.Router();

userRouter.get('/feed', userAuth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } });

    const userFeed = users.map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      skills: user.skills,
      photoURL: user.photoURL,
      about: user.about,
    }));
    res.status(200).send(userFeed);
  } catch (err) {
    res
      .status(500)
      .send({ message: 'Error fetching feed', error: err.message });
  }
});

module.exports = userRouter;
