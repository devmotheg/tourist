/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const path = require("path");
const express = require("express"),
	cookieParser = require("cookie-parser"),
	helmet = require("helmet"),
	rateLimit = require("express-rate-limit"),
	mongoSanitize = require("express-mongo-sanitize"),
	xss = require("xss-clean"),
	hpp = require("hpp"),
	compression = require("compression"),
	cors = require("cors");
const userRouter = require("./routers/user-router"),
	tourRouter = require("./routers/tour-router"),
	reviewRouter = require("./routers/review-router"),
	bookingRouter = require("./routers/booking-router"),
	viewRouter = require("./routers/view-router"),
	globalErrorController = require("./controllers/global-error-controller"),
	User = require("./models/user-model"),
	Tour = require("./models/tour-model"),
	Review = require("./models/review-model"),
	Booking = require("./models/booking-model"),
	AppError = require("./utils/app-error");

const app = express();

app.enable("trust proxy");

/* 1) TEMPLATE ENGINE */

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public/static")));

/* 2) GLOBAL MIDDLEWARES */

// Body parser with data size limit (SECURITY)
app.use(express.json({ limit: "10kb" }));

// Cookie parser
app.use(cookieParser());

// Security HTTP headers (SECURITY)
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'", "blob:", "https://*.mapbox.com"],
				scriptSrc: ["'self'", "blob:", "https://*.mapbox.com"],
			},
		},
	})
);

// Rate limiter for DOS attacks (SECURITY)
app.use(
	"/api",
	rateLimit({
		max: 100,
		windowMS: 1 * 60 * 60 * 100,
		message:
			"Too many requests sent from your IP address, try again in an hour or less",
	})
);

// Data sanitization against NoSQL query injection (SECURITY)
app.use(mongoSanitize());

// Data sanitization against XSS query attacks (SECURITY)
app.use(xss());

// HTTP paramter pollution preventer (SECURITY)
app.use(
	hpp({
		whitelist: [
			...Object.keys(User.schema.obj),
			...Object.keys(Tour.schema.obj),
			...Object.keys(Review.schema.obj),
			...Object.keys(Booking.schema.obj),
		],
	})
);

// Compresses transferred files for optimization
app.use(compression());

// Could also put these cors middlewares on specific routes only
// Implementing cross origin resource sharing to allow the use of our API
app.use(cors());
// Responding to preflight phase for -> non-simple requests (put, patch & delete requests) & non-standard verbs
app.options("*", cors());

/* 3) MAIN ROUTES MIDDLEWARES */

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/", viewRouter);

/* 4) UNHANDLED ROUTES MIDDLEWARE */

app.all("*", (req, res, next) => {
	// Triggering the global error handeling middleware (has 4 arguments) using next()
	next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

/* 5) GLOBAL ERROR HANDELING MIDDLEWARE */

app.use(globalErrorController);

module.exports = app;
