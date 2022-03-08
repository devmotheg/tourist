/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import APIRequest from "../utils/api-request";

const initReviews = (page?: string, user?: string) => {
	document.querySelector(".review-section")?.addEventListener("click", e => {
		let target = <HTMLButtonElement>e.target;
		if (target.matches(".del-review svg"))
			target = <HTMLButtonElement>target.parentElement;
		if (target.matches(".del-review svg use"))
			target = <HTMLButtonElement>target.parentElement?.parentElement;

		if (target.matches(".del-review"))
			target.addEventListener("click", () => {
				new APIRequest(target, { id: target.dataset.reviewId }, () =>
					location.reload()
				).deleteMyReview();
			});
	});
};

export default initReviews;
