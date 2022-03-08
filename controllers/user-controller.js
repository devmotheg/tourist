/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const path = require("path");
const multer = require("multer"),
	sharp = require("sharp");
const User = require("../models/user-model"),
	handlerFactory = require("../utils/handler-factory"),
	catchAsync = require("../utils/catch-async"),
	AppError = require("../utils/app-error");

/* 1) HELPER FUNCTIONS */

const useFactory = action => handlerFactory[action](User, "user");

/* 2) HELPER MIDDLEWARES */

// Multer options and configurations
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith("image")) cb(null, true);
	else cb(new AppError("Invalid file type for profile photo", 400), false);
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});

// Multer multipart data parser middleware
exports.uploadPhoto = upload.single("photo");

// Sharp image processing middleware
exports.resizePhoto = catchAsync(async (req, res, next) => {
	if (!req.file) return next();

	// Because I'm not keeping track of previous images, it doesn't matter if the new one overwrites the old one in the file system
	req.file.filename = `user-${req.user._u}.jpg`;

	await sharp(req.file.buffer)
		.resize(300, 300)
		.toFormat("jpg")
		.jpeg({ quality: 90 })
		.toFile(
			path.join(__dirname, `../public/static/img/users/${req.file.filename}`)
		);

	next();
});

/* 3) CURRENT-UESR ACTIONS */

exports.meUpdateInformation = catchAsync(async (req, res, next) => {
	req.filteredBody.photo = "default.jpg";
	if (req.file) req.filteredBody.photo = req.file.filename;

	await User.findByIdAndUpdate(
		req.user.id,
		req.filteredBody,
		req.updateOptions
	);

	res.status(200).json({
		status: "success",
		message: "You can use your new credentials any time now",
	});
});

exports.meDelete = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });

	res.status(204).json({
		status: "success",
	});
});

/* 4) ADMIN CRUD OPERATIONS */

exports.readAllUsers = useFactory("readAll");
exports.createUser = useFactory("createOne");
exports.readUser = useFactory("readOne");
exports.updateUser = useFactory("updateOne");
exports.deleteUser = useFactory("deleteOne");
