/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import Form from "../utils/form";

const initSignIn = (page?: string, user?: string) => {
	const $dom = <HTMLButtonElement>document.querySelector("button");
	new Form(["#email", "#password"], $dom, "signIn", undefined, false, () =>
		location.assign("/")
	);
};

export default initSignIn;
