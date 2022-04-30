const fs = require('fs');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

module.exports = {
  removeImage_: function (path, callback) {
    if (fs.existsSync(path)) {
      try {
        fs.unlinkSync(path)
        //file removed
        callback({ status: 200 });
      } catch (err) {
        callback({ status: 200 });
      }
    } else {
      callback({ status: 200 });
    }
  },
  adminToken: function (req, res, next) {
    var bearerToken = false;
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      console.log(bearer);
      bearerToken = bearer[1];
    }
    if (bearerToken) {
      var user = jwt.decode(bearerToken);
      // console.log(user);

      if (user) {
        // console.log(req.headers['authorization']);
        req.userDataFromToken = user.data;
        next();
      } else {
        res.status(401).json({
          message: 'invalid_token',
        });
      }
    } else {
      res.status(401).json({
        message: 'invalid_token',
      });
    }
  },

};

