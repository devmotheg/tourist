/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

// Higher order function
const catchAsync = asyncFun => {
  if (asyncFun.length === 3)
    return (req, res, next) => asyncFun(req, res, next).catch(next);

  if (asyncFun.length === 2)
    return function (result, next) {
      asyncFun.bind(this)(result, next).catch(next);
    };

  if (asyncFun.length === 1)
    return function (next) {
      asyncFun.bind(this)(next).catch(next);
    };
};

module.exports = catchAsync;
