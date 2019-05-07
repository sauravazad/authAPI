const mongoose = require("mongoose");
const passport = require("passport");
const router = require("express").Router();
const auth = require("../auth");
const Follower = mongoose.model("Follower");
const Users = mongoose.model("Users");
mongoose.set("useCreateIndex", true);

//  method to handle creation of followers and validation's
const createFollower = (username, id, follows, res) => {
  const newFollower = new Follower({
    username: username,
    userId: id,
    follows: follows
  });
  //  a user cannot follow himself/herself
  if (username == follows) {
    //  return an error
    res
      .status(406)
      .json({ errors: { message: "A user cannot follow him/her self." } });
  } else {
    //  check if the user already follows the person then just return the info
    Follower.find({ username: username, follows: follows })
      .then(found => {
        if (found && found.length) {
          return res.status(200).json({
            user: newFollower.toJSON(),
            message: "Already Following"
          });
        } else {
          //  check if the followed user exists or not if not return an error
          Users.find({ username: follows }).then(exist => {
            if (exist && exist.length) {
              return newFollower
                .save()
                .then(() =>
                  res.status(201).json({ user: newFollower.toJSON() })
                );
            } else {
              //  return an error that followed user does not exist
              res
                .status(404)
                .json({ errors: { message: "Followed user does not exist" } });
            }
          });
        }
      })
      .catch(err => {
        res.status(500);
      });
  }
};

const deleteFollower = (username, id, follows, res) => {
  //  delete the record
  Follower.deleteMany({ username: username, follows: follows }).then(found => {
    if (found && found.deletedCount) {
      //  destroy the record and return
      res
        .status(200)
        .json({ message: `You are no longer following ${follows}` });
    } else {
      res
        .status(404)
        .json({ errors: { message: "You are not following the user" } });
    }
  });
};
//POST route (required, only authenticated users have access)
router.post("/follow", auth.required, (req, res, next) => {
  const {
    payload: { id }
  } = req;
  const {
    body: { followUser = "" }
  } = req;
  if (!followUser) {
    return res.status(422).json({
      errors: {
        followUser: "is required"
      }
    });
  }
  //  check if session already exists and matches the id form token
  if (req.session._id === id) {
    return createFollower(req.session.username, id, followUser, res);
  } else {
    //  check for the user
    return Users.findById(id).then(user => {
      if (!user) {
        return res.sendStatus(400);
      }
      const authUser = user.toAuthJSON();
      req.session.sessionToken = authUser.token;
      req.session._id = authUser._id;
      req.session.username = authUser.username;
      return createFollower(authUser.username, authUser._id, followUser, res);
    });
  }
});

//POST route (required, only authenticated users have access)
router.delete("/unfollow", auth.required, (req, res, next) => {
  const {
    payload: { id }
  } = req;
  const {
    body: { followUser = "" }
  } = req;
  if (!followUser) {
    return res.status(422).json({
      errors: {
        followUser: "is required"
      }
    });
  }
  //  check if session already exists and matches the id from token
  if (req.session._id === id) {
    return deleteFollower(req.session.username, id, followUser, res);
  } else {
    //  check for the user
    return Users.findById(id).then(user => {
      if (!user) {
        return res.sendStatus(400);
      }
      const authUser = user.toAuthJSON();
      req.session.sessionToken = authUser.token;
      req.session._id = authUser._id;
      req.session.username = authUser.username;
      return deleteFollower(authUser.username, authUser._id, followUser, res);
    });
  }
});
module.exports = router;
