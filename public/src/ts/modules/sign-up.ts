/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import Form from "../utils/form";

const initSignUp = (page?: string, user?: string) => {
	const $dom = <HTMLButtonElement>document.querySelector("button");
	new Form(
		["#name", "#email", "#password", "#password-confirm"],
		$dom,
		"signUp",
		undefined,
		false,
		() => location.assign("/")
	);
};

export default initSignUp;
