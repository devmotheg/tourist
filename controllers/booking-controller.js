/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const Booking = require("../models/booking-model"),
	Tour = require("../models/tour-model"),
	handlerFactory = require("../utils/handler-factory"),
	catchAsync = require("../utils/catch-async"),
	AppError = require("../utils/app-error");

const useFactory = action => handlerFactory[action](Booking, "booking");

exports.passFilteredBody = catchAsync(async (req, res, next) => {
	req.tour = await Tour.findOne({ _u: req.body.tourId });
	req.filteredBody = {
		paid: req.body.paid,
		price: req.tour ? req.tour.price : null,
	};

	next();
});

exports.freezePaidBooking = catchAsync(async (req, res, next) => {
	const booking = await Booking.findOne({ _u: req.body.id });

	if (booking && booking.paid)
		return next(new AppError("Can't modify a paid booking", 401));

	next();
});

exports.meCreateBooking = useFactory("meCreateOne");
exports.meUpdateBooking = useFactory("meUpdateOne");
exports.meDeleteBooking = useFactory("meDeleteOne");

exports.readAllBookings = useFactory("readAll");
exports.createBooking = useFactory("createOne");
exports.readBooking = useFactory("readOne");
exports.updateBooking = useFactory("updateOne");
exports.deleteBooking = useFactory("deleteOne");
