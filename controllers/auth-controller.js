/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/user-model"),
	catchAsync = require("./../utils/catch-async"),
	AppError = require("./../utils/app-error"),
	Email = require("./../utils/email"),
	token = require("./../utils/token");

/* 1) HELPER FUNCTIONS */

const signUserIn = async (user, statusCode, req, res) => {
	const token = await promisify(jwt.sign)(
		{ id: user.id },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES_IN }
	);

	const cookieOptions = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		// Can't be modified in any shape or form
		httpOnly: true,
		// Can only be sent over secure connections (e.g. https)
		// req.secure because it exists in express, the other one is for Heroku proxies
		secure: req.secure || req.headers["x-forwarded-proto"] === "secure",
	};

	res.cookie("jwt", token, cookieOptions);
	res.status(statusCode).json({
		status: "success",
		message: "You're now signed in",
	});
};

/* 2) SIGNING ACTIONS */

exports.signUp = catchAsync(async (req, res, next) => {
	// We don't want everyone to have a role set to admin
	const userInfo = { ...req.body };
	delete userInfo.role;

	const newUser = await User.create(userInfo);
	const url = `${req.protocol}://${req.get("host")}/me/settings`;
	await new Email(newUser, url).sendWelcome();

	signUserIn(newUser, 201, req, res);
});

exports.signIn = catchAsync(async (req, res, next) => {
	// 1) Get email and password and make sure both are filled
	const { email, password } = req.body;
	if (!email || !password)
		return next(new AppError("Email or password is missing", 400));

	// 2) Check for email and password
	const user = await User.findOne({ email }).select("+password");
	// Not handeling the 2 separately (SECUTIRY)
	if (!user || !(await user.comparePassword(password, user.password)))
		return next(new AppError("Incorrect email or password", 401));

	// 3) Log the user in (send JWT to the client)
	signUserIn(user, 200, req, res);
});

exports.signOut = catchAsync(async (req, res, next) => {
	// Giving it a very short time, so it doesn't trigger an error in the firewall() middleware when it tries to verify the JWT token
	res.cookie("jwt", "signing out", {
		expires: new Date(Date.now() + 500),
		httpOnly: true,
	});

	res.status(200).json({
		status: "success",
		message: "You're now signed out",
	});
});

/* 3) AUTHENTICATION */

exports.firewall = ({ protect, notify, forbid }) =>
	catchAsync(async (req, res, next) => {
		// 1) Check if there's a token && that it is valid
		const { authorization } = req.headers;
		// -> Via request headers
		if (authorization && authorization.startsWith("Bearer"))
			var token = authorization.split(" ")[1];
		// -> Via cookies
		else if (req.cookies.jwt) var token = req.cookies.jwt;

		if (!token)
			return protect
				? next(new AppError("Sign in to access this route", 401))
				: next();

		// 2) Decode the payload out of the received token
		const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

		// 3) Get user from the id
		const user = await User.findById(decoded.id).select("+_id +password");

		// 4) Check if user exists
		if (!user)
			return protect
				? next(new AppError("This token belongs to a deleted user", 401))
				: next();

		// 5) Check if the user changed their password after token was issued
		if (user.passwordChangedAfter(decoded.iat))
			return protect
				? next(new AppError("Password was changed, sign in again", 401))
				: next();

		if (protect) req.user = user;
		if (notify) res.locals.user = user;

		// 6) Check if user is already logged in for certain routes and don't allow them in
		if (forbid) return next(new AppError("Sign out to access this route", 401));

		// 7) If everything went well, grant access!
		next();
	});

// Ask for current password for sensitive operations (SECURITY)
exports.verify = catchAsync(async (req, res, next) => {
	if (!req.body.currentPassword)
		return next(new AppError("Provide the current password"), 400);

	const user = req.user;

	if (!(await user.comparePassword(req.body.currentPassword, user.password)))
		return next(new AppError("Incorrect current password", 401));

	next();
});

/* 4) AUTHORIZATION */

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role))
			return next(
				new AppError("You don't have permission to perform this action", 403)
			);
		next();
	};
};

/* 5) CHANGING PASSWORD */

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1) Check if user exists
	const user = await User.findOne({ email: req.body.email });

	if (!user) return AppError.notFoundError("user", next);

	// 2) Generate a reset password token
	const resetToken = user.genPasswordResetToken();

	// 3) Wait for the changes to be saved in the DB
	await user.save({ validateBeforeSave: false });

	// 4) Send an email with the reset token
	let endPoint = `api/v1/users/reset-password/${resetToken}`;
	if (req.body.fromWebsite) endPoint = `reset-password/${resetToken}`;

	const resetUrl = `${req.protocol}://${req.get("host")}/${endPoint}`;

	try {
		await new Email(user, resetUrl).sendResetPassword();

		res.status(200).json({
			status: "success",
			message: "Token sent to email",
		});
	} catch (error) {
		user.passwordResetToken = user.passwordResetExpiresIn = undefined;
		await user.save({ validateBeforeSave: false });

		next(new AppError("Couldn't send the email, try again later", 500));
	}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
	// 1) Get user from token after hashing it
	const hashedToken = token.hash(req.params.token);

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpiresIn: { $gt: Date.now() },
	});

	// 2) Check if user exists
	if (!user)
		return next(
			new AppError("Password reset token is invalid or has expired", 400)
		);

	// 3) Change user password
	user.password = req.body.newPassword;
	user.passwordConfirm = req.body.newPasswordConfirm;
	user.passwordResetToken = user.passwordResetExpiresIn = undefined;

	// 4) Wait for the changes to be saved in the DB
	await user.save();

	// 5) Log the user in (send JWT to the client)
	signUserIn(user, 200, req, res);
});

exports.meUpdatePassword = catchAsync(async (req, res, next) => {
	const user = req.user;

	// 1) Change user password
	user.password = req.body.newPassword;
	user.passwordConfirm = req.body.newPasswordConfirm;

	// 2) Wait for the changes to be saved in the DB
	await user.save();

	// 3) Log the user in (send JWT to the client)
	signUserIn(user, 200, req, res);
});
