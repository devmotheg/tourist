/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import APIRequest from "../utils/api-request";

const initBooking = (page?: string, user?: string) => {
	document
		.querySelector(".book-tour")
		?.addEventListener("click", function (this: HTMLButtonElement) {
			new APIRequest(this, { tourId: this.dataset.tourId }, () =>
				location.assign("/me/bookings")
			).createMyBooking();
		});
};

export default initBooking;
