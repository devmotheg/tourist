/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const express = require("express");
const authController = require("../controllers/auth-controller"),
  tourController = require("../controllers/tour-controller"),
  middlewares = require("../utils/middlewares");

const router = express.Router();

router
  .route("/")
  .get(tourController.readAllTours)
  .post(
    authController.firewall({ protect: true }),
    authController.restrictTo("lead-guide", "admin"),
    middlewares.passFilteredBody(
      "name",
      "duration",
      "maxGroupSize",
      "difficulty",
      "price",
      "summary",
      "description",
      "startLocation",
      "guidesIds"
    ),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.readTour)
  .patch(
    authController.firewall({ protect: true }),
    authController.restrictTo("lead-guide", "admin"),
    middlewares.passFilteredBody(
      "name",
      "duration",
      "maxGroupSize",
      "difficulty",
      "price",
      "summary",
      "description",
      "startLocation",
      "guidesIds"
    ),
    middlewares.passUpdateOptions("new", "runValidators"),
    tourController.updateTour
  )
  .delete(
    authController.firewall({ protect: true }),
    authController.restrictTo("lead-guide", "admin"),
    tourController.deleteTour
  );

module.exports = router;
