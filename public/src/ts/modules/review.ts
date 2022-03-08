/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import APIRequest from "../utils/api-request";

const initReview = (page?: string, user?: string) => {
	let rating = 0;
	const $dom = document.querySelector(".review-stars");

	$dom?.querySelectorAll(".star svg").forEach((e, i) => {
		e.addEventListener("click", () => {
			rating = i + 1;
			for (let idx = 0; idx < $dom.children.length; idx++) {
				const $svg = $dom.children[idx].querySelector("svg");

				if (idx <= i) {
					$svg?.classList.remove("fill-neutral-500");
					$svg?.classList.add("fill-secondary");
				} else {
					$svg?.classList.remove("fill-secondary");
					$svg?.classList.add("fill-neutral-500");
				}
			}
		});
	});

	const method = page === "createReview" ? "createMyReview" : "updateMyReview";
	document
		.querySelector(".send")
		?.addEventListener("click", function (this: HTMLButtonElement) {
			new APIRequest(
				this,
				{
					id: this.dataset.id,
					tourId: this.dataset.tourId,
					rating,
					comment: document.querySelector("textarea")?.value,
				},
				() => location.assign(`/tour/${this.dataset.slug}`)
			)[method]();
		});
};

export default initReview;
