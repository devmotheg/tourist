/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const AppError = require("../utils/app-error");

/* 1) HELPER FUNCTIONS */

const renderError = (res, statusCode, msg) =>
	res.status(statusCode).render("pages/error", {
		title: "Error",
		page: "error",
		msg,
	});

/* 2) ERROR FORMATERS */

const handleCastErrorDB = err => {
	const message = `Invalid value (${err.value}) for ${err.path}`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
	const errorsObj = err.errors;
	const errorsArr = Object.keys(errorsObj).map(e => {
		const error = errorsObj[e];
		if (error.name === "ValidatorError") return error.message;
		else if (error.name === "CastError")
			return `Data type for ${error.path} must be ${error.valueType}`;
	});
	const message = `Invalid input: ${errorsArr.join(". ")}`;
	return new AppError(message, 400);
};

const handleDuplicatedFieldDB = err => {
	const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
	const message = `Duplicate field value: ${value}`;
	return new AppError(message, 400);
};

const handleJWTError = () =>
	new AppError("Invalid token. Log in again to gain access", 401);

const handleJWTExpiredError = () =>
	new AppError("Expired token. Log in again to gain access", 401);

/* 3) ERROR SENDERS */

const sendErrorDev = (err, req, res) => {
	console.error(err);
	if (req.originalUrl.startsWith("/api"))
		// - API
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
			error: err,
			stack: err.stack,
		});
	// - RENDERED WEBSITE
	else renderError(res, err.statusCode, err.message);
};

const sendErrorProd = (err, req, res) => {
	console.error(err);
	console.error(err.__proto__);
	// Operational error, we send our nicely formatted message!
	if (err.isOperational)
		if (req.originalUrl.startsWith("/api"))
			// - API
			res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		// - RENDERED WEBSITE
		else renderError(res, err.statusCode, err.message);
	// Non-operational error, We don't leak any details to the client-side (SECURITY)!
	else {
		if (req.originalUrl.startsWith("/api"))
			// - API
			res.status(500).json({
				status: "error",
				message: "Something went wrong in the server",
			});
		// - RENDERED WEBSITE
		else renderError(res, 500, "Something went wrong in the server");
	}
};

/* 4) GLOBAL ERROR HANDELING MIDDLEWARE */

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	// Display as much details to help fix the bug
	if (process.env.NODE_ENV === "development")
		return sendErrorDev(err, req, res);

	// Marking MongoDB, mongoose & JWT errors as operational
	// Could of also used JSON.parse(JSON.strigify()) to copu the err obj
	let errCopy = Object.assign(Object.create(err), { ...err });
	errCopy.message = err.message;

	if (err.name === "CastError") {
		errCopy = handleCastErrorDB(err);
	}
	if (err.name === "ValidationError") {
		errCopy = handleValidationErrorDB(err);
	}
	if (err.code === 11000) {
		errCopy = handleDuplicatedFieldDB(err);
	}
	if (err.name === "JsonWebTokenError") {
		errCopy = handleJWTError();
	}
	if (err.name === "TokenExpiredError") {
		errCopy = handleJWTExpiredError();
	}

	// Prevent detail leaks (SECURITY)
	if (process.env.NODE_ENV === "production") sendErrorProd(errCopy, req, res);
};
