/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const mongoose = require("mongoose");
const User = require("./user-model"),
	Tour = require("./tour-model"),
	schemaFields = require("../utils/schema-fields"),
	catchAsync = require("../utils/catch-async");

/* 1) SCHEMA */

const reviewSchema = new mongoose.Schema(
	{
		_u: schemaFields.uniqueId(),
		userId: schemaFields.referenceModel(
			{
				Model: User,
				name: "user",
			},
			"review"
		),
		tourId: schemaFields.referenceModel(
			{
				Model: Tour,
				name: "tour",
			},
			"review"
		),
		comment: schemaFields.stringField({
			model: "review",
			name: "comment",
			required: true,
			maxlength: 280,
		}),
		rating: schemaFields.numberField({
			model: "review",
			name: "rating",
			min: 1,
			max: 5,
		}),
		createdAt: schemaFields.createdAt(),
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

/* 2) INDEXING */

// Preventing the same user to review the tour multiple times
reviewSchema.index({ tourId: 1, userId: 1 }, { unique: true });

/* 3) HOOKS/MIDDLEWARES */

// Using .post() because we need to wait for the currently added review to be saved
reviewSchema.post("save", function () {
	this.constructor.calcRatingsStats(this.tourId);
});

reviewSchema.pre(/^find/, function (next) {
	this.select("-id");
	this.populate({
		path: "tourId",
		select: "_u name slug",
	}).populate({
		path: "userId",
		select: "name email photo",
	});

	next();
});

reviewSchema.pre(
	/^findOneAnd/,
	catchAsync(async function (next) {
		// Copy the query, because if I don't I'm basically executing it twice, here and in the handler-factory file...
		this.review = await this.model.findOne(this._conditions);

		next();
	})
);

reviewSchema.post(
	/^findOneAnd/,
	catchAsync(async function (result, next) {
		if (this.review.populated("tourId")) this.review.depopulate("tourId");

		// Could also directly use Review model here because by the time this hook is called it will be already defined
		if (this.review)
			this.review.constructor.calcRatingsStats(this.review.tourId);

		next();
	})
);

/* 4) STATIC METHODS */

reviewSchema.statics.calcRatingsStats = async function (tourId) {
	const stats = (
		await this.aggregate([
			{
				$match: { tourId },
			},
			{
				$group: {
					_id: "$tourId",
					ratingsAverage: { $avg: "$rating" },
					ratingsQuantity: { $sum: 1 },
				},
			},
		])
	)[0];

	await Tour.findByIdAndUpdate(tourId, {
		ratingsAverage: stats ? stats.ratingsAverage : 0,
		ratingsQuantity: stats ? stats.ratingsQuantity : 0,
	});
};

/* 5) MODEL */

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
