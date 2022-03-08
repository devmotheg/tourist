/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const Review = require("../models/review-model"),
	Tour = require("../models/tour-model"),
	Booking = require("../models/booking-model"),
	handlerFactory = require("../utils/handler-factory"),
	catchAsync = require("../utils/catch-async"),
	AppError = require("../utils/app-error");

const useFactory = action => handlerFactory[action](Review, "review");

exports.passFilteredBody = catchAsync(async (req, res, next) => {
	req.tour = await Tour.findOne({ _u: req.body.tourId });
	req.filteredBody = {
		rating: req.body.rating,
		comment: req.body.comment,
	};

	next();
});

exports.preventInvalidReview = catchAsync(async (req, res, next) => {
	const booking = await Booking.findOne({
		userId: req.user.id,
		tourId: req.tour.id,
	});
	if (!booking || !booking.paid)
		next(
			new AppError(
				"You must book this tour and confirm your payment to post a review"
			),
			400
		);

	next();
});

exports.meCreateReview = useFactory("meCreateOne");
exports.meUpdateReview = useFactory("meUpdateOne");
exports.meDeleteReview = useFactory("meDeleteOne");

exports.readAllReviews = useFactory("readAll");
exports.createReview = useFactory("createOne");
exports.readReview = useFactory("readOne");
exports.updateReview = useFactory("updateOne");
exports.deleteReview = useFactory("deleteOne");
