const express = require('express');

const requestRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

requestRouter.post(
  '/request/send/:status/:toUserId',
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: 'User not found!' });
      }

      const allowedStatuses = ['ignored', 'interested'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed values are: ${allowedStatuses.join(
            ', '
          )}`,
        });
      }

      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingRequest) {
        return res
          .status(400)
          .send({ message: 'Connection request already sent' });
      }

      const newRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      await newRequest.save();

      res.status(200).send({
        message:
          req.user.firstName +
          ' is ' +
          status +
          ' to connect with ' +
          toUser.firstName,
      });
    } catch (err) {
      res.status(500).send({
        message: 'Error sending connection request',
        error: err.message,
      });
    }
  }
);

requestRouter.post(
  '/request/review/:status/:requestId',
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const allowedStatuses = ['accepted', 'rejected'];
      const { status, requestId } = req.params;

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed values are: ${allowedStatuses.join(
            ', '
          )}`,
        });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: 'interested',
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: 'Connection request not found' });
      }

      connectionRequest.status = status;
      await connectionRequest.save();

      res.status(200).json({
        message: `Connection request ${status} successfully`,
      });
    } catch (err) {
      res.status(500).json({
        message: 'Error reviewing connection request',
        error: err.message,
      });
    }
  }
);

module.exports = requestRouter;
