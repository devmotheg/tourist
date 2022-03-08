/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

exports.passUpdateOptions = (...options) => {
	return (req, res, next) => {
		req.updateOptions = {};

		for (const option of options) req.updateoptions[option] = true;

		next();
	};
};

exports.passFilteredBody = (...fields) => {
	return (req, res, next) => {
		req.filteredBody = {};

		for (const field of fields) req.filteredBody[field] = req.body[field];

		next();
	};
};
