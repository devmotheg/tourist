/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const APIFeatures = require("./api-features"),
	catchAsync = require("./catch-async"),
	AppError = require("./app-error");

exports.meCreateOne = (Model, name) =>
	catchAsync(async (req, res, next) => {
		if (!req.tour) return AppError.notFoundError(name, next);

		await Model.create(
			Object.assign(
				{ userId: req.user.id, tourId: req.tour.id },
				req.filteredBody
			)
		);

		res.status(201).json({
			status: "success",
			message: `Your ${name} was registered`,
		});
	});

exports.meUpdateOne = (Model, name) =>
	catchAsync(async (req, res, next) => {
		const updated = await Model.findOneAndUpdate(
			{ _u: req.body.id, userId: req.user.id },
			req.filteredBody
		);

		if (!updated) return AppError.notFoundError(name, next);

		res.status(200).json({
			status: "success",
			message: `Your ${name} information were updated`,
		});
	});

exports.meDeleteOne = (Model, name) =>
	catchAsync(async (req, res, next) => {
		const deleted = await Model.findOneAndDelete({
			_u: req.body.id,
			userId: req.user.id,
		});

		if (!deleted) return AppError.notFoundError(name, next);

		res.status(204).json({
			status: "success",
		});
	});

exports.readAll = (Model, name) =>
	catchAsync(async (req, res, next) => {
		const { query } = new APIFeatures(Model.find({}), req.query)
			.filter()
			.sort()
			.select()
			.paginate();

		const read = await query;

		res.status(200).json({
			status: "success",
			data: { [`${name}s`]: read },
		});
	});

exports.createOne = (Model, name) =>
	catchAsync(async (req, res, next) => {
		const created = await Model.create(req.filteredBody);
		// Won't affect the copy in the DB if we I didn't run .save()
		if (name === "user") created.password = undefined;

		res.status(201).json({
			status: "success",
			data: { [name]: created },
		});
	});

exports.readOne = (Model, name) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findOne({ _u: req.params.id });
		if (name === "tour") query = query.populate("reviews");

		const read = await query;

		if (!read) return AppError.notFoundError(name, next);

		res.status(200).json({
			status: "success",
			data: { [name]: read },
		});
	});

exports.updateOne = (Model, name) =>
	catchAsync(async (req, res, next) => {
		const updated = await Model.findOneAndUpdate(
			{ _u: req.params.id },
			req.filteredBody,
			req.updateOptions
		);

		if (!updated) return AppError.notFoundError(name, next);

		res.status(200).json({
			status: "success",
			data: { [name]: updated },
		});
	});

exports.deleteOne = (Model, name) =>
	catchAsync(async (req, res, next) => {
		const deleted = await Model.findOneAndDelete({ _u: req.params.id });

		if (!deleted) return AppError.notFoundError(name, next);

		res.status(204).json({
			status: "success",
		});
	});
