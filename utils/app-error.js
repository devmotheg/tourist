/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

class AppError extends Error {
	constructor(message, statusCode) {
		super(message);

		this.statusCode = statusCode;
		// Rounding/flooring the number, could also be done with ~~ or Math.floor() or parseInt()
		this.status = ((statusCode / 100) | 0) === 5 ? "error" : "fail";
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}

	static notFoundError(name, next) {
		next(new AppError(`This ${name} doesn't exist`, 404));
	}
}

module.exports = AppError;
