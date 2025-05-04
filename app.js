// Load environment variables
require("dotenv").config();

// Core Modules
const path = require("path");

// External Modules
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");

// Local Modules
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

// Construct MongoDB URL
const MONGO_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=${process.env.MONGO_APP_NAME}`;

// Express App Initialization
const app = express();

// Utility function to generate random strings
const randomString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
};

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const filename = `${randomString(10)}-${file.originalname}`;
    cb(null, filename);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
  cb(null, allowedTypes.includes(file.mimetype));
};
const multerOptions = { storage, fileFilter };

// Middleware Setup
app.use(multer(multerOptions).single("photo"));
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(rootDir, "public")));
app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/host/uploads", express.static(path.join(rootDir, "uploads"))); // Ensure this is the right path for your host images
app.use("/homes/uploads", express.static(path.join(rootDir, "uploads")));
app.use(express.urlencoded({ extended: true }));

// Session Store
const store = new MongoDBStore({
  uri: MONGO_URL,
  collection: "sessions",
});

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store,
  })
);

// Auth State Middleware
app.use((req, res, next) => {
  console.log("ye hai hamari Cookie", req.get("cookie"));
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

// Route Middleware
app.use(authRouter);
app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);
app.use(errorsController.pageNotFound);

// Server and DB Initialization
const PORT = process.env.PORT || 3000;
mongoose
  .connect(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log("Cookies and Sessions");
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error While connecting to mongo ", err);
  });
