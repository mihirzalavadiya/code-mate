const express = require('express');
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const authRouter = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/', authRouter);
app.use('/', userRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);

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
