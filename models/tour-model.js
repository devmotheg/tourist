/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const mongoose = require("mongoose"),
	slugify = require("slugify");
const User = require("./user-model"),
	schemaFields = require("../utils/schema-fields");

/* 1) SCHEMA */

const tourSchema = new mongoose.Schema(
	{
		_u: schemaFields.uniqueId(),
		name: schemaFields.stringField({
			model: "tour",
			name: "name",
			unique: true,
			required: true,
			minlength: 1,
			maxlength: 85,
		}),
		slug: mongoose.SchemaTypes.String,
		duration: schemaFields.numberField({
			model: "tour",
			name: "duration",
			required: true,
			min: 1,
			max: 14,
		}),
		maxGroupSize: schemaFields.numberField({
			model: "tour",
			name: "group size",
			required: true,
			min: 5,
			max: 25,
		}),
		difficulty: Object.assign(
			schemaFields.stringField({
				model: "tour",
				name: "difficuty",
				required: true,
			}),
			{
				enum: {
					values: ["easy", "medium", "difficult"],
					message:
						"A tour's difficulty can only be set to easy, medium or difficult",
				},
			}
		),
		// Both ratings fields represent a summary of the related data-set (reviews) on the main data-set (tour)
		// Will help reduce queries of the related data-set when we need its info (this is a popular technique in data modeling)
		ratingsAverage: Object.assign(
			schemaFields.numberField({
				model: "tour",
				name: "ratings average",
				min: 0,
				max: 5,
			}),
			{
				default: 0,
				set: val => Math.round(val * 10) / 10, // 4.666 -> 46.66 -> 47 -> 4.7
			}
		),
		ratingsQuantity: Object.assign(
			schemaFields.numberField({
				model: "tour",
				name: "ratings quantity",
				min: 0,
			}),
			{
				default: 0,
			}
		),
		price: schemaFields.numberField({
			model: "tour",
			name: "price",
			required: true,
			min: 0,
		}),
		summary: schemaFields.stringField({
			model: "tour",
			name: "summary",
			required: true,
			minlength: 50,
			maxlength: 280,
		}),
		description: schemaFields.stringField({
			model: "tour",
			name: "description",
			required: true,
			minlength: 100,
			maxlength: 560,
		}),
		coverImage: schemaFields.stringField({
			model: "tour",
			name: "cover image",
			required: true,
			default: "default.jpg",
		}),
		// GeoJSON object
		startLocation: {
			type: {
				type: mongoose.SchemaTypes.String,
				default: "Point",
				match: [/^Point$/, "Location type can only be set to point"],
			},
			// [longitude (vertical position measured from meridian), latitude (horizontal position measured from equator)]
			// Reversed from normal just like the y axis in browsers || the y and x indices in matrices
			coordinates: [mongoose.SchemaTypes.Number],
			description: mongoose.SchemaTypes.String,
		},
		guidesIds: [
			schemaFields.referenceModel(
				{
					Model: User,
					name: "user",
				},
				"tour"
			),
		],
		createdAt: schemaFields.createdAt(),
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

/* 2) INDEXING */

// Can either be single (one field specified) or compound (multiple)
tourSchema.index({ slug: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: "2dsphere" });

/* 3) VIRTUAL */

// Virtual populate
tourSchema.virtual("reviews", {
	ref: "Review",
	foreignField: "tourId",
	localField: "_id",
});

/* 4) HOOKS/MIDDLEWARES */

// `this` refers to the document object
tourSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });

	next();
});

// `this` refers to the query object
tourSchema.pre(/^find/, function (next) {
	this.select("-id");
	this.populate({ path: "guidesIds", select: "name photo role" });

	next();
});

/* 5) MODEL */

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
