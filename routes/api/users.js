const mongoose = require("mongoose");
const passport = require("passport");
const router = require("express").Router();
const auth = require("../auth");
const Users = mongoose.model("Users");
mongoose.set("useCreateIndex", true);

//POST new user route (optional, everyone has access)
router.post("/", auth.optional, (req, res, next) => {
  const {
    body: { user = {} }
  } = req;

  if (!user.username) {
    return res.status(422).json({
      errors: {
        username: "is required"
      }
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: "is required"
      }
    });
  }
  //  check if the user already exist's if so return an error with correct http code
  Users.findOne({ username: user.username })
    .then(found => {
      if (found) {
        return res.status(409).json({
          errors: {
            message: "username already exists"
          }
        });
      } else {
        const finalUser = new Users(user);
        finalUser.setPassword(user.password);
        return finalUser
          .save()
          .then(() => res.json({ user: finalUser.toAuthJSON() }));
      }
    })
    .catch(err => {
      return res.status(500).json({
        errors: {
          message: "Internal Server Error"
        }
      });
    });
});

//POST login route (optional, everyone has access)
router.post("/login", auth.optional, (req, res, next) => {
  const {
    body: { user = {} }
  } = req;
  if (!user.username) {
    return res.status(422).json({
      errors: {
        username: "is required"
      }
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: "is required"
      }
    });
  }

  return passport.authenticate(
    "local",
    { session: false },
    (err, passportUser, info) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        const user = passportUser;
        const authUser = user.toAuthJSON();
        req.session.sessionToken = authUser.token;
        req.session._id = authUser._id;
        req.session.username = authUser.username;
        //  manually set some cooke if required
        // res.cookie("sessionToken", user.token);
        res.cookie("_id", authUser._id);
        return res.json({ user: authUser });
      }

      return res.status(401).json({
        errors: info.errors
      });
    }
  )(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get("/current", auth.required, (req, res, next) => {
  const {
    payload: { id }
  } = req;
  //  check if session already exists and matches the id form token
  if (req.session._id === id) {
    return res.json({
      user: { username: req.session.username, _id: id },
      message: "Session found"
    });
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
      return res.json({ user: user.toAuthJSON() });
    });
  }
});

module.exports = router;
