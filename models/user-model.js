/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const mongoose = require("mongoose"),
	validator = require("validator"),
	bcrypt = require("bcryptjs");
const token = require("../utils/token"),
	schemaFields = require("../utils/schema-fields"),
	catchAsync = require("../utils/catch-async");

/* 1) SCHEMA */

const userSchema = new mongoose.Schema({
	_u: schemaFields.uniqueId(),
	name: Object.assign(
		schemaFields.stringField({
			model: "user",
			name: "name",
			required: true,
			minlength: 2,
			maxlength: 18,
		}),
		{
			match: [/^[a-zA-Z]{2,} ?(?:[a-zA-Z]{2,})?$/, "Invalid user's name"],
		}
	),
	email: Object.assign(
		schemaFields.stringField({
			model: "user",
			name: "email",
			unique: true,
			required: true,
		}),
		{
			lowercase: true,
			validate: [validator.default.isEmail, "Please enter a valid email"],
		}
	),
	photo: {
		type: mongoose.SchemaTypes.String,
		default: "default.jpg",
	},
	role: {
		type: mongoose.SchemaTypes.String,
		default: "user",
		enum: {
			values: ["user", "guide", "lead-guide", "admin"],
			message:
				"A user's role can only be set to user, guide, lead-guide, or admin",
		},
	},
	password: Object.assign(
		schemaFields.stringField({
			model: "user",
			name: "password",
			required: true,
			minlength: 8,
			// Didn't specify a maximum length for security purposes
		}),
		{
			select: false,
		}
	),
	passwordConfirm: Object.assign(
		schemaFields.stringField({
			model: "user",
			name: "password confirmation",
			required: true,
		}),
		{
			validate: {
				// Only works on .create() && .save()!! (By default...)
				validator: function (val) {
					return this.password === val;
				},
				message: "Password confirm doesn't match password",
			},
		}
	),
	passwordChangedAt: mongoose.SchemaTypes.Date,
	passwordResetToken: mongoose.SchemaTypes.String,
	passwordResetExpiresIn: mongoose.SchemaTypes.Date,
	// For deleting users (we don't actually delete them from the DB)
	active: {
		type: mongoose.SchemaTypes.Boolean,
		default: true,
		select: false,
	},
	createdAt: schemaFields.createdAt(),
});

/* 2) HOOKS/MIDDLEWARES */

// Pay attention to that we must always use save and not update for password modifications to run the validators && the encryption middleware
userSchema.pre(
	"save",
	catchAsync(async function (next) {
		if (!this.isModified("password")) return next();

		this.password = await bcrypt.hash(
			this.password,
			process.env.BCRYPT_SALT - "0"
		);
		this.passwordConfirm = undefined;

		// To prevent some edge case where issuing the token can be faster than saving to DB
		if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;

		next();
	})
);

userSchema.pre(/^find/, function (next) {
	this.select("-id");
	this.find({ active: { $ne: false } });

	next();
});

/* 3) INSTANCE METHODS */

// Following fat-models, thin-controllers architecture
userSchema.methods.comparePassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		// Could of also used another rounding/flooring ways like parseInt(), etc...
		const changedTimestamp = ~~(this.passwordChangedAt.getTime() / 1000);
		return changedTimestamp >= JWTTimestamp;
	}
	return false;
};

userSchema.methods.genPasswordResetToken = function () {
	const resetToken = token.random();

	this.passwordResetToken = token.hash(resetToken);
	this.passwordResetExpiresIn = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

/* 4) MODEL */

const User = mongoose.model("User", userSchema);

module.exports = User;
