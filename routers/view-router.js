/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const express = require("express");
const authController = require("../controllers/auth-controller"),
	viewController = require("../controllers/view-controller");

const router = express.Router();

router.get(
	"/",
	authController.firewall({ notify: true }),
	viewController.renderOverview
);
router.get(
	"/tour/:slug",
	authController.firewall({ notify: true }),
	viewController.renderTour
);

router.get(
	"/sign-in",
	authController.firewall({ notify: true, forbid: true }),
	viewController.renderSignIn
);
router.get(
	"/sign-up",
	authController.firewall({ notify: true, forbid: true }),
	viewController.renderSignUp
);
router.get(
	"/forgot-password",
	authController.firewall({ notify: true, forbid: true }),
	viewController.renderForgotPassword
);
router.get(
	"/reset-password/:token",
	authController.firewall({ notify: true, forbid: true }),
	viewController.renderResetPassword
);

router.get(
	"/tour/:slug/create-review",
	authController.firewall({ protect: true, notify: true }),
	viewController.renderCreateReview
);
router.get(
	"/tour/:slug/update-review/:id",
	authController.firewall({ protect: true, notify: true }),
	viewController.renderUpdateReview
);

router.get(
	["/me", "/me/settings"],
	authController.firewall({ protect: true, notify: true }),
	viewController.renderMeSettings
);
router.get(
	"/me/reviews",
	authController.firewall({ protect: true, notify: true }),
	viewController.renderMeReviews
);
router.get(
	"/me/bookings",
	authController.firewall({ protect: true, notify: true }),
	viewController.renderMeBookings
);

module.exports = router;
