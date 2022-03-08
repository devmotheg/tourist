/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import Form from "../utils/form";

const initSettings = (page?: string, user?: string) => {
	const $accountInfo = <HTMLButtonElement>(
		document.querySelector(".account-info")
	);
	new Form(
		["#current-password-info", "#name", "#email"],
		$accountInfo,
		"updateMyInfo",
		{
			photo: () => {
				const $file = <HTMLInputElement>document.querySelector("#file");
				return $file.files ? $file.files[0] : undefined;
			},
		},
		true,
		() => location.reload()
	);

	const $passChange = <HTMLButtonElement>document.querySelector(".pass-change");
	new Form(
		["#current-password-change", "#new-password", "#new-password-confirm"],
		$passChange,
		"updateMyPassword",
		undefined,
		false,
		() => location.reload()
	);
};

export default initSettings;
