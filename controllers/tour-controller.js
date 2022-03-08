/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const Tour = require("../models/tour-model.js"),
  handlerFactory = require("../utils/handler-factory");

const useFactory = action => handlerFactory[action](Tour, "tour");

exports.readAllTours = useFactory("readAll");
exports.createTour = useFactory("createOne");
exports.readTour = useFactory("readOne");
exports.updateTour = useFactory("updateOne");
exports.deleteTour = useFactory("deleteOne");
