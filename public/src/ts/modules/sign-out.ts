/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import APIRequest from "../utils/api-request";

const initSignOut = () => {
	const $dom = document.querySelector(".sign-out");
	$dom?.addEventListener("click", () => {
		new APIRequest(<HTMLButtonElement>$dom, undefined, () =>
			location.assign("/")
		).signOut();
	});
};

export default initSignOut;
