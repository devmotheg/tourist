/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const mongoose = require("mongoose");
const User = require("./user-model"),
	Tour = require("./tour-model"),
	schemaFields = require("../utils/schema-fields");

const bookingSchema = new mongoose.Schema({
	_u: schemaFields.uniqueId(),
	userId: schemaFields.referenceModel(
		{
			Model: User,
			name: "user",
		},
		"booking"
	),
	tourId: schemaFields.referenceModel(
		{
			Model: Tour,
			name: "tour",
		},
		"booking"
	),
	price: schemaFields.numberField({
		model: "booking",
		name: "price",
		required: true,
	}),
	paid: {
		type: mongoose.SchemaTypes.Boolean,
		default: false,
	},
	createdAt: schemaFields.createdAt(),
});

// No duplicate bookings
bookingSchema.index({ tourId: 1, userId: 1 }, { unique: true });

bookingSchema.pre(/^find/, function (next) {
	this.select("-id");

	next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
