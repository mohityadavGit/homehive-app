const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

require("express-validator");

// LOGIN PAGE
exports.getlogin = (req, res, next) => {
  console.log("get login page se hun ", req.url);
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    isLoggedIn: false,
    oldInput: {
      email: "",
    },
    errors: [],
    user: {},
  });
};

// LOGIN LOGIC
exports.postlogin = (req, res, next) => {
  console.log("post login page se hun ", req.url, req.method);
  const { email, password } = req.body;

  User.findOne({ email }) // ✅ FIXED: findOne expects an object
    .then((user) => {
      console.log("user email gaya", user);
      if (!user) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          currentPage: "login",
          isLoggedIn: false,
          errors: ["User not found"],
          oldInput: {
            email,
            password,
          },
          user: {},
        });
      }

      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          console.log("password mill gaya, bole to user hi mil gya", user);
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        } else {
          return res.status(422).render("auth/login", {
            pageTitle: "Login",
            currentPage: "login",
            isLoggedIn: false,
            errors: ["Invalid email or password"],
            oldInput: {
              email,
              password,
            },
            user: {},
          });
        }
      });
    })
    .catch((err) => {
      console.error("Login error:", err);
      res.status(500).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: ["Something went wrong. Please try again."],
        oldInput: {
          email,
          password,
        },
        user: {},
      });
    });
};

// LOGOUT
exports.getlogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

// SIGNUP PAGE
exports.getSignup = (req, res, next) => {
  console.log("get SIGNUP page se hun ", req.url);
  res.render("auth/sign-up", {
    pageTitle: "signup",
    currentPage: "signup",
    isLoggedIn: false,
    errors: [],
    oldInput: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      userType: "",
    },
    user: {},
  });
};

// SIGNUP LOGIC
exports.postSignup = [
  check("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name should be at least 2 characters long")
    .matches(/^[a-zA-Z]+$/)
    .withMessage("First Name should only contain alphabetic characters"),

  check("lastName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last Name should be at least 2 characters long")
    .matches(/^[a-zA-Z]+$/)
    .withMessage("Last Name should only contain alphabetic characters"),

  check("email").isEmail().withMessage("Please enter a valid email address"),

  check("password")
    .isLength({ min: 6 }) // ✅ Fix: min should be 6, not 2
    .withMessage("Password should be at least 6 characters long"),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Confirm Password does not match Password"),

  check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage('User Type must be either "guest" or "host"'),

  (req, res, next) => {
    console.log("get SIGNUP page se hun ", req.body);
    const { firstName, lastName, email, password, confirmPassword, userType } =
      req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/sign-up", {
        pageTitle: "signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array().map((err) => err.msg),
        oldInput: {
          firstName,
          lastName,
          email,
          password,
          userType,
          confirmPassword,
        },
        user: {},
      });
    }

    bcrypt.hash(password, 12).then((hashedPassword) => {
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userType,
      });

      user
        .save()
        .then((result) => {
          console.log("User Created", result);
          res.redirect("/login");
        })
        .catch((err) => {
          console.log("Error in creating user", err);
          res.status(500).render("auth/sign-up", {
            pageTitle: "signup",
            currentPage: "signup",
            isLoggedIn: false,
            errors: [err.message],
            oldInput: {
              firstName,
              lastName,
              email,
              password,
              userType,
              confirmPassword,
            },
            user: {},
          });
        });
    });
  },
];
