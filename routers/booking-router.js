/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const express = require("express");
const authController = require("../controllers/auth-controller"),
	bookingController = require("../controllers/booking-controller"),
	middlewares = require("../utils/middlewares");

const router = express.Router();

router.use(authController.firewall({ protect: true }));

router
	.route("/me")
	.post(bookingController.passFilteredBody, bookingController.meCreateBooking)
	.patch(
		bookingController.passFilteredBody,
		bookingController.freezePaidBooking,
		bookingController.meUpdateBooking
	)
	.delete(
		bookingController.freezePaidBooking,
		bookingController.meDeleteBooking
	);

router.use(authController.restrictTo("lead-guide", "admin"));

router
	.route("/")
	.get(bookingController.readAllBookings)
	.post(
		middlewares.passFilteredBody("userId", "tourId", "price", "paid"),
		bookingController.createBooking
	);

router
	.route("/:id")
	.get(bookingController.readBooking)
	.patch(
		middlewares.passFilteredBody("price", "paid"),
		middlewares.passUpdateOptions("new", "runValidators"),
		bookingController.updateBooking
	)
	.delete(bookingController.deleteBooking);

module.exports = router;