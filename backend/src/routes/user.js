const express = require('express');
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const { connect } = require('mongoose');

const userRouter = express.Router();

const SAFE_USER_FIELDS = 'firstName lastName photoURL about skills';

userRouter.get('/user/pending/requests', userAuth, async (req, res) => {
  try {
    const longedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: longedInUser._id,
      status: 'interested',
    }).populate('fromUserId', SAFE_USER_FIELDS);

    res.status(200).send(connectionRequests);
  } catch (err) {
    res.status(500).send({
      message: 'Error fetching connection requests',
      error: err.message,
    });
  }
});

userRouter.get('/user/connections', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const acceptedConnections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: 'accepted' },
        { toUserId: loggedInUser._id, status: 'accepted' },
      ],
    })
      .populate('fromUserId', SAFE_USER_FIELDS)
      .populate('toUserId', SAFE_USER_FIELDS);

    const connections = acceptedConnections.map((connection) => {
      const isFromUser = connection.fromUserId._id.equals(loggedInUser._id);
      const otherUser = isFromUser
        ? connection.toUserId
        : connection.fromUserId;
      return { otherUser };
    });

    res.status(200).send(connections);
  } catch (err) {
    res
      .status(500)
      .send({ message: 'Error fetching connections', error: err.message });
  }
});

userRouter.get('/user/feed', userAuth, async (req, res) => {
  try {
    //User should see all the user cards expect
    // 1. his own card
    // 2. his connnection
    // 3. ignored people
    // 4. already sent connection request (interested, rejected)
    // 5. add pagination and limit in now

    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 25 ? 25 : limit;

    const skip = (page - 1) * limit;

    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select('fromUserId toUserId');

    const excludedUserIds = new Set();
    excludedUserIds.add(loggedInUser._id.toString());

    connections.forEach((req) => {
      excludedUserIds.add(req.fromUserId.toString());
      excludedUserIds.add(req.toUserId.toString());
    });

    const feedUsers = await User.find({
      _id: { $ne: loggedInUser._id, $nin: Array.from(excludedUserIds) },
    })
      .select(SAFE_USER_FIELDS)
      .skip(skip)
      .limit(limit);

    res.status(200).json({ data: feedUsers });
  } catch (err) {
    res
      .status(500)
      .send({ message: 'Error fetching feed', error: err.message });
  }
});

module.exports = userRouter;
