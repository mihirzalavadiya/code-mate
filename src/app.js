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
      const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      res.cookie('token', token);
      res.status(200).send({ message: 'Login successful' });
    } else {
      res.status(400).send({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).send({ message: 'Error logging in', error: err.message });
  }
});

app.get('/profile', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    const userProfile = {
      firstName: user.firstName,
      lastName: user.lastName,
      skills: user.skills,
      photoURL: user.photoURL,
    };

    res.status(200).send(userProfile);
  } catch (err) {
    res
      .status(500)
      .send({ message: 'Error fetching profile', error: err.message });
  }
});

app.get('/feed', async (req, res) => {
  try {
    const users = await User.find();
    const userFeed = users.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      skills: user.skills,
      photoURL: user.photoURL,
    }));
    res.status(200).send(userFeed);
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

app.delete('/user', async (req, res) => {
  try {
    const userId = req.body.id;
    await User.findByIdAndDelete(userId);
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error deleting user', error: err });
  }
});

app.patch('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updateData = req.body;

    if (!validateEditProfileData(req)) {
      throw new Error('Invalid Update Request');
    }

    await User.findByIdAndUpdate({ _id: userId }, updateData, {
      runValidators: true,
    });
    res.status(200).send({ message: 'User updated successfully' });
  } catch (error) {
    res
      .status(500)
      .send({ message: 'Error updating user', error: error.message });
  }
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
