const express = require('express');

const app = express();

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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
