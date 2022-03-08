/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import APIRequest from "../utils/api-request";

const initBookings = (page?: string, user?: string) => {
	document.querySelector(".booking-section")?.addEventListener("click", e => {
		let target = <HTMLButtonElement>e.target;
		if (target.matches("button svg"))
			target = <HTMLButtonElement>target.parentElement;
		if (target.matches("button svg use"))
			target = <HTMLButtonElement>target.parentElement?.parentElement;

		if (target.matches(".del-booking"))
			new APIRequest(target, { id: target.dataset.bookingId }, () =>
				target.parentElement?.remove()
			).deleteMyBooking();

		if (target.matches(".pay-booking"))
			new APIRequest(target, { id: target.dataset.bookingId, paid: true }, () =>
				location.reload()
			).updateMyBooking();
	});
};

export default initBookings;
