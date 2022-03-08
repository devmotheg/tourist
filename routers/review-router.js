/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const express = require("express");
const authController = require("../controllers/auth-controller"),
	reviewController = require("../controllers/review-controller"),
	middlewares = require("../utils/middlewares");

const router = express.Router();

router.use(authController.firewall({ protect: true }));

router
	.route("/me")
	.post(
		authController.restrictTo("user"),
		reviewController.passFilteredBody,
		reviewController.preventInvalidReview,
		reviewController.meCreateReview
	)
	.patch(
		authController.restrictTo("user"),
		reviewController.passFilteredBody,
		reviewController.meUpdateReview
	)
	.delete(authController.restrictTo("user"), reviewController.meDeleteReview);

router.use(authController.restrictTo("admin"));

router
	.route("/")
	.get(reviewController.readAllReviews)
	.post(
		middlewares.passFilteredBody("userId", "tourId", "comment", "rating"),
		reviewController.createReview
	);

router
	.route("/:id")
	.get(reviewController.readReview)
	.patch(
		middlewares.passFilteredBody("comment", "rating"),
		middlewares.passUpdateOptions("new", "runValidators"),
		reviewController.updateReview
	)
	.delete(reviewController.deleteReview);

module.exports = router;
