const express = require('express');
const { adminAuth, userAuth } = require('./middlewares/auth.js');

const app = express();

app.use('/admin', adminAuth);

app.get('/admin/getAllData', (req, res) => {
  res.send({ data: 'This is all the data for admin' });
});

app.delete('/admin/deleteData/:id', (req, res) => {
  const dataId = req.params.id;
  res.send({ message: `Data with id ${dataId} deleted successfully` });
});

app.post('/user/login', (req, res) => {
  // no need to use userAuth middleware for login route
  res.send({ message: 'User logged in successfully' });
});

app.use('/user', userAuth);

app.get('/user', (req, res) => {
  res.send({ name: 'John Doe', age: 30 });
});

app.post('/user', (req, res) => {
  res.send({ message: 'User created successfully' });
});

app.delete('/user/:id', (req, res) => {
  const userId = req.params.id;
  res.send({ message: `User with id ${userId} deleted successfully` });
});

app.get('/user/getAllUsers', (req, res) => {
  throw new Error('MZ'); // Simulate an error
});

// write one api for error handling
app.use('/', (err, req, res, next) => {
  if (err) {
    res.status(500).send({ message: 'Internal Server Error' });
  } else {
    res.send({ message: 'No error' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
