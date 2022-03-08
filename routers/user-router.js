/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const express = require("express");
const authController = require("../controllers/auth-controller"),
	userController = require("../controllers/user-controller"),
	middlewares = require("../utils/middlewares");

const router = express.Router();

router.post(
	"/sign-up",
	authController.firewall({ forbid: true }),
	authController.signUp
);
router.post(
	"/sign-in",
	authController.firewall({ forbid: true }),
	authController.signIn
);
router.get("/sign-out", authController.signOut);

router.post(
	"/forgot-password",
	authController.firewall({ forbid: true }),
	authController.forgotPassword
);
router.patch(
	"/reset-password/:token",
	authController.firewall({ forbid: true }),
	authController.resetPassword
);

// Protecting all the route handlers after it (must be logged in)
router.use(authController.firewall({ protect: true }));

router.patch(
	"/me/update-password",
	authController.verify,
	authController.meUpdatePassword
);

router.patch(
	"/me/update-information",
	userController.uploadPhoto,
	authController.verify,
	userController.resizePhoto,
	middlewares.passFilteredBody("name", "email", "photo"),
	userController.meUpdateInformation
);
router.delete("/me/delete", authController.verify, userController.meDelete);

// Restricting the following CRUD operations for admins only
router.use(authController.restrictTo("admin"));

router
	.route("/")
	.get(userController.readAllUsers)
	.post(
		middlewares.passFilteredBody(
			"name",
			"email",
			"role",
			"password",
			"passwordConfirm"
		),
		userController.createUser
	);

router
	.route("/:id")
	.get(userController.readUser)
	.patch(
		middlewares.passFilteredBody("name", "email", "role"),
		middlewares.passUpdateOptions("new"),
		userController.updateUser
	)
	.delete(userController.deleteUser);

module.exports = router;
