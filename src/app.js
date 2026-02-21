const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');

const app = express();

app.use(express.json());

app.post('/signup', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send({ message: 'User created successfully', user });
  } catch (err) {
    res.status(500).send({ message: 'Error saving user', error: err.message });
  }
});

app.get('/feed', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: 'Error fetching users', error: err });
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

    const ALLOWED_UPDATE_FIELDS = [
      'age',
      'gender',
      'skills',
      'photoURL',
      'about',
    ];

    const isAllowed = Object.keys(updateData).every((field) =>
      ALLOWED_UPDATE_FIELDS.includes(field)
    );

    if (!isAllowed) {
      throw new Error('Invalid update fields');
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
