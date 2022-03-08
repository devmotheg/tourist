/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import Form from "../utils/form";

const initForgotPassword = (page?: string, user?: string) => {
	const $dom = <HTMLButtonElement>document.querySelector("button");
	new Form(["#email"], $dom, "forgotPassword", { fromWebsite: () => true });
};

export default initForgotPassword;
