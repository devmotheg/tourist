/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const Tour = require("../models/tour-model"),
	Review = require("../models/review-model"),
	Booking = require("../models/booking-model"),
	catchAsync = require("../utils/catch-async"),
	AppError = require("../utils/app-error");

exports.renderOverview = catchAsync(async (req, res, next) => {
	const tours = await Tour.find({});
	res.status(200).render("pages/overview", {
		title: "All Tours",
		page: "overview",
		tours,
	});
});

exports.renderTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findOne({ slug: req.params.slug }).populate({
		path: "reviews",
		fields: "userId comment rating",
	});

	if (!tour) return next(new AppError("This tour doesn't exist", 404));

	let booking;
	if (res.locals.user)
		booking = await Booking.findOne({
			userId: res.locals.user.id,
			tourId: tour.id,
		});

	res.status(200).render("pages/tour", {
		title: `${tour.name} Tour`,
		page: "tour",
		tour,
		booking,
	});
});

exports.renderSignIn = (req, res, next) =>
	res.status(200).render("pages/sign-in", {
		title: "Sign In",
		page: "signIn",
	});

exports.renderSignUp = (req, res, next) =>
	res.status(200).render("pages/sign-up", {
		title: "Sign Up",
		page: "signUp",
	});

exports.renderForgotPassword = (req, res, next) =>
	res.status(200).render("pages/forgot-password", {
		title: "Forgot Password",
		page: "forgotPassword",
	});

exports.renderResetPassword = (req, res, next) =>
	res.status(200).render("pages/reset-password", {
		title: "Reset Password",
		page: "resetPassword",
	});

exports.renderCreateReview = catchAsync(async (req, res, next) => {
	const tour = await Tour.findOne({ slug: req.params.slug }).select("_u slug");

	res.status(200).render("pages/review", {
		title: "Create Review",
		page: "createReview",
		tour,
	});
});

exports.renderUpdateReview = catchAsync(async (req, res, next) => {
	const review = await Review.findOne({
		_u: req.params.id,
		userId: req.user.id,
	});

	if (!review) return AppError.notFoundError("review", next);

	res.status(200).render("pages/review", {
		title: "Update Review",
		page: "updateReview",
		tour: review.tourId,
		review,
	});
});

exports.renderMeSettings = (req, res, next) =>
	res.status(200).render("pages/me/settings", {
		title: "My Settings",
		page: "mySettings",
		active: "settings",
	});

exports.renderMeReviews = catchAsync(async (req, res, next) => {
	const reviews = await Review.find({ userId: req.user.id });
	res.status(200).render("pages/me/reviews", {
		title: "My Reviews",
		page: "myReviews",
		active: "reviews",
		reviews,
	});
});

exports.renderMeBookings = catchAsync(async (req, res, next) => {
	const bookings = await Booking.find({ userId: req.user.id }).populate(
		"tourId"
	);

	res.status(200).render("pages/me/bookings", {
		title: "My Bookings",
		page: "myBookings",
		active: "bookings",
		bookings,
	});
});
