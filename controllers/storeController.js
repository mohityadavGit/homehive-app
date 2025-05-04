const Home = require("../models/home");
const User = require("../models/user");

// 🏠 Show homepage with homes
exports.getIndex = async (req, res, next) => {
  try {
    const registeredHomes = await Home.find();
    res.render("store/index", {
      registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error loading index:", err);
    res.redirect("/");
  }
};

// 📋 Show all homes list
exports.getHomes = async (req, res, next) => {
  try {
    const registeredHomes = await Home.find();
    res.render("store/home-list", {
      registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error loading homes:", err);
    res.redirect("/");
  }
};

exports.getFavouriteList = async (req, res, next) => {
  try {
    const userId = req.session.user._id;

    // Fetch the full User document and populate favourites
    const user = await User.findById(userId).populate("favourites");

    res.render("store/favourite-list", {
      pageTitle: "My Favourites",
      currentPage: "favourites",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
      favouritesHomes: user.favourites,
    });
  } catch (err) {
    console.error("Error fetching favourites:", err);
    next(err);
  }
};

// 📚 Bookings page
exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

// ❤️ Add to favourites
exports.postAddToFavourite = async (req, res, next) => {
  console.log(req.body);
  const homeId = req.body.houseid;
  console.log("home id ", homeId);
  const userId = req.session.user._id;
  try {
    const user = await User.findById(userId);
    if (!user.favourites.includes(homeId)) {
      user.favourites.push(homeId);
      await user.save();
    }
    res.redirect("/favourites");
  } catch (err) {
    console.error("Error adding to favourites:", err);
    res.redirect("/homes");
  }
};

// ❌ Remove from favourites
exports.postRemoveFromFavourite = async (req, res, next) => {
  console.log("hum to ae  hi ae hain ", req.body);
  const homeId = req.params._id;
  console.log("hum to delete hone hi ae hain ", homeId);
  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId);
    user.favourites = user.favourites.filter((fav) => !fav.equals(homeId));
    await user.save();
    res.redirect("/favourites");
  } catch (err) {
    console.error("Error removing from favourites:", err);
    res.redirect("/favourites");
  }
};

// 🏡 Single Home Detail Page
exports.getHomeDetails = async (req, res, next) => {
  const homeId = req.params._id;

  try {
    const home = await Home.findById(homeId);
    if (!home) {
      console.log("Home not found");
      return res.redirect("/homes");
    }
    res.render("store/home-detail", {
      home,
      pageTitle: "Home Detail",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error fetching home detail:", err);
    res.redirect("/homes");
  }
};
