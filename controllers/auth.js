const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { createJWT } = require("../utils/auth");
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
exports.signup = (req, res, next) => {
  let { name, email, password, password_confirmation } = req.body;

  if (!name) {
    return res.status(422).json({ name: "Name is required." });
  }
  if (!email) {
    return res.status(422).json({ email: "Email is required." });
  }
  if (!emailRegexp.test(email)) {
    return res.status(422).json({ email: "Invalid Email." });
  }
  if (!password) {
    return res.status(422).json({ password: "Password is required." });
  }
  if (password != password_confirmation) {
    return res.status(422).json({ confirm: "Password not match." });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        return res.status(422).json({ email: "Email already exists" });
      } else {
        const user = new User({
          name: name,
          email: email,
          password: password,
        });
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) throw err;
            user.password = hash;
            user
              .save()
              .then((response) => {
                res.status(200).json({
                  success: true,
                  result: response,
                });
              })
              .catch((err) => res.status(500).send(err));
          });
        });
      }
    })
    .catch(() => res.status(500).send("Something went wrong"));
};
exports.signin = (req, res) => {
  let { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ email: "Email is required." });
  }
  if (!emailRegexp.test(email)) {
    return res.status(422).json({ email: "Invalid Email." });
  }
  if (!password) {
    return res.status(422).json({ password: "Password is required." });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ email: "User Not Found" });
      }
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (!isMatch) {
            return res.status(400).json({ password: "Wrong Password" });
          }
          let access_token = createJWT(user.email, user._id, 3600);
          jwt.verify(access_token, process.env.TOKEN_SECRET, (err, decoded) => {
            if (err) {
              res.status(500).send(err.toString());
            }
            if (decoded) {
              return res.status(200).json({
                success: true,
                token: access_token,
                message: user,
              });
            }
          });
        })
        .catch((err) => res.status(500).send(err.toString()));
    })
    .catch((err) => res.status(500).send(err));
};
