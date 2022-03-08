/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

// webpack bundling
import "../css/index.css";

// Own modules
import initSignIn from "./modules/sign-in";
import initSignUp from "./modules/sign-up";
import initSignOut from "./modules/sign-out";
import initForgotPassword from "./modules/forgot-password";
import initResetPassword from "./modules/reset-password";
import initMapbox from "./modules/mapbox";
import initReviews from "./modules/reviews";
import initSettings from "./modules/settings";
import initReview from "./modules/review";
import initBooking from "./modules/booking";
import initBookings from "./modules/bookings";

// Main script logic
const getDataFromMeta = (name: string) =>
	(<HTMLMetaElement>document.querySelector(`meta[data-${name}]`)).dataset;

const page = <string>getDataFromMeta("page").page,
	user = <string>getDataFromMeta("user").user;

interface Page {
	[index: string]: ((page?: string, user?: string) => void)[];
}

const pages: Page = {
	base: [initSignOut],
	overview: [],
	tour: [initMapbox, initReviews, initBooking],
	signIn: [initSignIn],
	signUp: [initSignUp],
	forgotPassword: [initForgotPassword],
	resetPassword: [initResetPassword],
	createReview: [initReview],
	updateReview: [initReview],
	mySettings: [initSettings],
	myReviews: [initReviews],
	myBookings: [initBookings],
	error: [],
};

for (const components of [pages.base, pages[page]])
	for (const component of components) component(page, user);
