const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');

const app = express();

app.post('/signup', async (req, res) => {
  const userObj = {
    firstName: 'Shivu',
    lastName: 'Zalavadiya',
    email: 'shivu@gmail.com',
    password: 'shivu@1234',
    age: 26,
    gender: 'Female',
  };
  const user = new User(userObj);
  await user.save();
  try {
    res.status(201).send({ message: 'User created successfully', user });
  } catch (err) {
    res.status(500).send({ message: 'Error saving user', error: err });
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
