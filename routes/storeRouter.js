// External Module
const express = require("express");
const storeRouter = express.Router();

// Local Module
const homesController = require("../controllers/storeController");

storeRouter.get("/", homesController.getIndex);
storeRouter.get("/homes", homesController.getHomes);
storeRouter.get("/bookings", homesController.getBookings);
storeRouter.get("/favourites", homesController.getFavouriteList);
storeRouter.get("/homes/:_id", homesController.getHomeDetails);
storeRouter.post("/favourites", homesController.postAddToFavourite);
storeRouter.get(
  "/favourites/remove/:_id",
  homesController.postRemoveFromFavourite
);

module.exports = storeRouter;
