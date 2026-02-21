const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');
const bycrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {
  validateSignUpData,
  validateLoginData,
  validateEditProfileData,
} = require('./utils/validation');
const { userAuth } = require('./middlewares/auth');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.post('/signup', async (req, res) => {
  try {
    validateSignUpData(req);
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bycrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).send({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error saving user', error: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    validateLoginData(req);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie('token', token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.status(200).send({ message: 'Login successful' });
    } else {
      res.status(400).send({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).send({ message: 'Error logging in', error: err.message });
  }
});

app.get('/profile', userAuth, async (req, res) => {
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

app.get('/feed', userAuth, async (req, res) => {
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

app.delete('/user', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    res.cookie('token', null, { expires: new Date(Date.now()) });
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error deleting user', error: err });
  }
});

app.patch('/user/edit', userAuth, async (req, res) => {
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

app.post('/logout', async (req, res) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
  });
  res.send({ message: 'Logout Successful!!' });
});

connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
