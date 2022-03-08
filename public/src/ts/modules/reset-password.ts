/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import Form from "../utils/form";

const initResetPassword = (page?: string, user?: string) => {
	const token = new URL(location.href).pathname.split("/").pop();

	const $dom = <HTMLButtonElement>document.querySelector("button");
	new Form(
		["#new-password", "#new-password-confirm"],
		$dom,
		"resetPassword",
		{ token: () => token },
		false,
		() => location.assign("/me")
	);
};

export default initResetPassword;
