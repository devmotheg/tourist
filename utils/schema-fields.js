/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const { SchemaTypes } = require("mongoose"),
	{ v4: uuidv4 } = require("uuid");

exports.uniqueId = () => {
	return {
		type: SchemaTypes.String,
		immutable: true,
		unique: true,
		default: uuidv4,
	};
};

exports.referenceModel = (foreign, local) => {
	return {
		type: SchemaTypes.ObjectId,
		ref: foreign.Model.modelName,
		required: [true, `A ${local} must belong to ${foreign.name}`],
		validate: {
			validator: async id => !!(await foreign.Model.findById(id)),
			message: `Invalid ${foreign.name} ID`,
		},
	};
};

exports.stringField = ({
	model,
	name,
	unique,
	required,
	minlength,
	maxlength,
}) => {
	const field = {
		type: SchemaTypes.String,
		unique,
		required: [required, `A ${model} must have ${name}`],
	};

	for (const field of [
		[minlength, "minlength", "Minimum"],
		[maxlength, "maxlength", "Maximum"],
	])
		if (field[0])
			Object.assign(field, {
				[field[1]]: [
					field[0],
					`${field[2]} ${name} length for a ${model} is ${field[0]}`,
				],
			});

	return field;
};

exports.numberField = ({ model, name, required, min, max }) => {
	const field = {
		type: SchemaTypes.Number,
		required: [required, `A ${model} must have ${name}`],
	};

	for (const field of [
		[min, "min", "Minimum"],
		[max, "max", "Maximum"],
	])
		if (field[0])
			Object.assign(field, {
				[field[1]]: [
					field[0],
					`${field[2]} ${name} for ${model} is ${field[0]}`,
				],
			});

	return field;
};

exports.createdAt = () => {
	return {
		type: SchemaTypes.Date,
		default: Date.now,
	};
};
