const Home = require("../models/home");
const fs = require("fs");
// GET: Show "Add Home" form
exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

// GET: Show "Edit Home" form
exports.getEditHome = (req, res, next) => {
  const houseid = req.params._id;
  console.log(houseid, "yahi selected hai ");
  const editing = req.query.editing === "true";

  Home.findById(houseid)
    .then((home) => {
      if (!home) {
        console.log("No home found");
        return res.redirect("/host/host-home-list");
      }

      res.render("host/edit-home", {
        pageTitle: "Edit Your Home",
        currentPage: "host-homes",
        editing: editing,
        home: home,
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.error("Error finding home:", err);
      res.redirect("/host/host-home-list");
    });
};

// GET: All host homes
exports.getHostHomes = (req, res, next) => {
  Home.find() // ✅ using Mongoose's find
    .then((registeredHomes) =>
      res.render("host/host-home-list", {
        registeredHomes: registeredHomes,
        pageTitle: "Host Homes List",
        currentPage: "host-homes",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      })
    )
    .catch((err) => {
      console.error("Error fetching homes:", err);
      res.redirect("/");
    });
};

// POST: Add a new home
exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, description } = req.body;
  console.log("ye ghar ka data hai ", req.body);
  console.log("ye photo file hai ", req.file);
  if (!req.file) {
    return res.status(422).send("NO Image Provide");
  }
  const photo = req.file.path;
  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    description,
  });

  home
    .save()
    .then(() => {
      console.log("Home Saved Successfully");
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.error("Error saving home:", err);
      res.redirect("/host/host-home-list");
    });
};

const mongoose = require("mongoose"); // Ensure mongoose is required for ObjectId validation

exports.postEditHome = (req, res, next) => {
  const { _id, houseName, price, location, rating, description } = req.body;

  // Log the incoming request body for debugging
  console.log("Request Body:", req.body);

  // Check if _id is missing or invalid
  if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
    console.error("Invalid or missing houseid (_id):", _id);
    return res.redirect("/host/host-home-list"); // Or show an error message to the user
  }

  // Find the home by its ID
  Home.findById(_id)
    .then((home) => {
      if (!home) {
        console.error("Home not found with id:", _id);
        return res.redirect("/host/host-home-list"); // Redirect if home not found
      }

      // Update the home details
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.description = description;

      if (req.file) {
        // Delete the old photo if it exists
        if (home.photo && fs.existsSync(home.photo)) {
          fs.unlink(home.photo, (err) => {
            if (err) {
              console.error("Error while deleting file:", err);
            } else {
              console.log("Old file deleted successfully.");
            }
          });
        }

        // Save the new photo path
        home.photo = req.file.path;
      }
      // Save the updated home
      return home.save();
    })
    .then(() => {
      console.log("Home updated successfully");
      res.redirect("/host/host-home-list"); // Redirect to home list after successful update
    })
    .catch((err) => {
      console.error("Error editing home:", err);
      res.redirect("/host/host-home-list"); // Redirect if there's an error
    });
};

// DELETE: Delete home by ID
exports.getdeleteByid = (req, res, next) => {
  const houseid = req.params._id;

  Home.findByIdAndDelete(houseid)
    .then(() => {
      console.log("Home deleted");
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.error("Error deleting home:", err);
      res.redirect("/host/host-home-list");
    });
};
